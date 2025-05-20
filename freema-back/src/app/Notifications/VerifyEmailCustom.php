<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\VerifyEmail as BaseVerifyEmail;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\URL;
use Illuminate\Notifications\Messages\MailMessage;

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

    // トークン生成
    $token = $notifiable->createToken('email-verify')->plainTextToken;

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

    return (new MailMessage)
      ->subject('メールアドレス確認')
      ->greeting('こんにちは！')
      ->line('以下のリンクをクリックしてメールアドレスを確認してください。')
      ->action('メールアドレスを確認する', $url)
      ->line('もしこのメールに覚えがない場合は、無視してください。')
      ->salutation('coachtechフリマ サポートチームより');
  }
}
