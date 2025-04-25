<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use App\Notifications\VerifyEmailCustom;

use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\Facades\URL;

class User extends Authenticatable implements MustVerifyEmail
{
  use HasApiTokens, HasFactory, Notifiable;
  // use Billable;   // Stripe用

  // 初期値を定義する
  protected $attributes = [
    'role' => 21,   // 一般ユーザー
  ];

  /**
   * The attributes that are mass assignable.
   *
   * @var array<int, string>
   */
  protected $fillable = [
    'name',
    'email',
    'password',
    'zipcode',
    'address',
    'building',
    'role',
    'img_filename'
  ];

  /**
   * The attributes that should be hidden for serialization.
   *
   * @var array<int, string>
   */
  protected $hidden = [
    'password',
    'remember_token',
  ];

  /**
   * The attributes that should be cast.
   *
   * @var array<string, string>
   */
  protected $casts = [
    'email_verified_at' => 'datetime',
  ];


  public function scopeKeywordSearch($query, $keyword_expression)
  {
    if (!empty($keyword_expression)) {
      $expression_s = mb_convert_kana($keyword_expression, 's'); // 全角スペースを半角スペースに変換
      $keywords = explode(' ', $expression_s);

      foreach ($keywords as $keyword) {
        $query->where(function ($query) use ($keyword) {
          $query->Where('name', 'like', '%' . $keyword . '%')
            ->orWhere('email', 'like', '%' . $keyword . '%');
        });
      }
    }
  }

  public function scopeRoleSearch($query, $role)
  {
    if (!empty($role)) {
      $query->where('role', $role);
    }
  }

  public function managers()
  {
    return $this->hasMany(Manager::class);
  }

  public function purchases()
  {
    return $this->hasMany(Purchase::class);
  }

  public function sendEmailVerificationNotification()
  {
    $this->notify(new VerifyEmailCustom());
  }
  // public function sendEmailVerificationNotification()
  // {
  //   $this->notify(new class($this) extends VerifyEmail {
  //     protected $user;

  //     public function __construct($user)
  //     {
  //       $this->user = $user;
  //     }

  //     public function toMail($notifiable)
  //     {
  //       $verifyUrl = URL::temporarySignedRoute(
  //         'verification.verify',
  //         now()->addMinutes(60),
  //         [
  //           'id' => $notifiable->getKey(),
  //           'hash' => sha1($notifiable->getEmailForVerification()),
  //         ]
  //       );

  //       // カスタム：フロントのURLにリダイレクト用クエリを追加
  //       $frontendUrl = config('app.frontend_url') . '/verify-email?' . parse_url($verifyUrl, PHP_URL_QUERY);

  //       return (new MailMessage)
  //         ->subject('メールアドレス確認')
  //         ->line('以下のリンクをクリックしてメールアドレスを確認してください。')
  //         ->action('メールアドレスを確認', $frontendUrl)
  //         ->line('このリンクは60分間有効です。');
  //     }
  //   });
  // }
}
