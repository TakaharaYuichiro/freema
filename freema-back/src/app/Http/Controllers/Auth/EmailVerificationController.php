<?php

declare(strict_types=1);

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Providers\RouteServiceProvider;
use Illuminate\Http\Request;
use App\Http\Requests\EmailVerificationRequest;  // Illuminateからコピペして作成したRequest

class EmailVerificationController extends Controller
{
  /**
   * 確認メール送信画面
   */
  public function index(Request $request)
  {
    return $request->user()->hasVerifiedEmail()
      ? redirect()->intended(RouteServiceProvider::HOME)
      : view('auth.verify-email-massage');
  }

  /**
   * 確認メール送信
   *
   * @param  Request  $request
   */
  public function notification(Request $request)
  {
    $user = $request->user();

    if ($user->hasVerifiedEmail()) {
      return response()->json(['message' => '既に確認済みです。']);
    }

    $user->sendEmailVerificationNotification();

    return response()->json(['message' => '確認メールを送信しました。']);
  }

  /**
   * メールリンクの検証
   *
   * @param  Request  $request
   */

  public function verification(EmailVerificationRequest $request)
  {
    $user = $request->user(); // authorize()で本人確認済み

    if ($user->hasVerifiedEmail()) {
      return response()->json(['message' => '既に確認済みです。']);
    }

    $request->fulfill(); // email_verified_at を更新＆Verifiedイベント発火

    // Sanctumトークンを発行
    $token = $user->createToken('email-verify')->plainTextToken;

    return response()->json([
      'message' => 'メールアドレスを確認しました。',
      'token' => $token,
      'user' => $user
    ]);
  }

  public function resend(Request $request) {
    if (!$request->user()) {
      return response()->json(['message' => 'ユーザーが見つかりません。'], 401);
    }
    if ($request->user()->hasVerifiedEmail()) {
      return response()->json(['message' => 'すでに確認済みです。'], 200);
    }
    $request->user()->sendEmailVerificationNotification();
    return response()->json(['message' => '確認メールを再送しました。']);
  }
}
