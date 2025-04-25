<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\VerifyEmail as BaseVerifyEmail;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\URL;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\Facades\Log;
use App\Mail\ConfirmMail;

class VerifyEmailCustom extends BaseVerifyEmail
{
  protected function verificationUrl($notifiable)
  {
    // 署名付きURL（元々 Laravel が送るやつ）
    $temporarySignedURL = URL::temporarySignedRoute(
      'verification.verify',
      Carbon::now()->addMinutes(60),
      [
        'id' => $notifiable->getKey(),
        'hash' => sha1($notifiable->getEmailForVerification()),
      ]
    );
    Log::debug($temporarySignedURL);

    // // Nuxt 側のURLに変換
    // $frontendURL = config('app.frontend_url') . '/email/verify';

    // // クエリ部分を抽出して、Nuxtに渡す
    // $queryParams = parse_url($temporarySignedURL, PHP_URL_QUERY);

    // return $frontendURL . '?' . $queryParams;


    // クエリを抽出
    // $queryParams = parse_url($temporarySignedURL, PHP_URL_QUERY);

    // トークン生成（←重要ポイント！）
    $token = $notifiable->createToken('email-verify')->plainTextToken;

    // Nuxt 側の画面にリダイレクト（id, hash, expires, signature など含む）
    // $frontendURL = config('app.frontend_url') . '/verify-email?' . $queryParams;
    // $frontendURL = config('app.frontend_url') . '/verify-email?' . $queryParams . '&token=' . $token;




    $frontendURL = config('app.frontend_url') . '/verify-email' .
      '?id=' . $notifiable->getKey() .
      '&hash=' . sha1($notifiable->getEmailForVerification()) .
      '&' . parse_url($temporarySignedURL, PHP_URL_QUERY) . 
      '&token=' . $token;


    return $frontendURL;
  }

  public function toMail($notifiable)
  {
    $url = $this->verificationUrl($notifiable);

    
    // Mail::to($profile['email'])->send(new ConfirmMail($subject, $mailContent));



    return (new MailMessage)
      ->subject('メールアドレス確認')
      ->greeting('こんにちは！') // ← ここで「Hello!」を変更
      ->line('以下のリンクをクリックしてメールアドレスを確認してください。')
      ->action('メールアドレスを確認する', $url)
      ->line('もしこのメールに覚えがない場合は、無視してください。')
      ->salutation('Freema サポートチームより'); 
  }

  // public function toMail($notifiable)
  // {
  //   $verifyUrl = URL::temporarySignedRoute(
  //     'verification.verify',
  //     Carbon::now()->addMinutes(60),
  //     ['id' => $notifiable->getKey(), 'hash' => sha1($notifiable->getEmailForVerification())]
  //   );

  //   // Vue アプリ用にリダイレクトURLを調整
  //   $spaUrl = 'http://localhost:3000/verify-email'
  //     . '?id=' . $notifiable->getKey()
  //     . '&hash=' . sha1($notifiable->getEmailForVerification())
  //     . '&token=' . optional(auth()->user())->currentAccessToken()?->token;

  //   return (new MailMessage)
  //     ->subject('メールアドレス確認')
  //     ->line('以下のリンクをクリックしてメールアドレスを確認してください。')
  //     ->action('メールアドレス確認', $spaUrl)
  //     ->line('もしこのメールに覚えがない場合は、無視していただいてかまいません。');
  // }
}
