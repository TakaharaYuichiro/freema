<?php

declare(strict_types=1);

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Providers\RouteServiceProvider;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

use App\Http\Requests\EmailVerificationRequest;  // Illuminateからコピペして作成したRequest
use Illuminate\Support\Facades\Log;

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
   * @return RedirectResponse|View
   */
  // public function notification(Request $request)
  // {
  // 	/** @var User $user */
  // 	$user = $request->user();

  // 	// メール確認済みの場合はトップへ
  // 	if ($user->hasVerifiedEmail()) {
  // 		return redirect()->intended(RouteServiceProvider::HOME);
  // 	}

  // 	// メール送信
  // 	$user->sendEmailVerificationNotification();
  // 	session() -> put('status','verification-link-sent');
  // 	return view('auth.verify-email-massage');
  // }

  public function notification(Request $request)
  {
    $user = $request->user();

    if ($user->hasVerifiedEmail()) {
      return response()->json(['message' => '既に確認済みです。']);
    }

    $user->sendEmailVerificationNotification();

    return response()->json(['message' => '確認メールを再送信しました。']);
  }

  /**
   * メールリンクの検証
   *
   * @param  Request  $request
   * @return RedirectResponse
   */

   public function verification(EmailVerificationRequest $request)
{
    $user = $request->user(); // これだけでOK。authorize()で本人確認済み

    if ($user->hasVerifiedEmail()) {
        return response()->json(['message' => 'Already verified']);
    }

    $request->fulfill(); // email_verified_at を更新＆Verifiedイベント発火

    // Sanctumトークンを発行
    $token = $user->createToken('email-verify')->plainTextToken;

    return response()->json([
        'message' => 'メールアドレスを確認しました',
        'token' => $token,
        'user' => $user
    ]);
}


  // public function verification(EmailVerificationRequest $request)
  // {
  //   Log::debug($request->user()->hasVerifiedEmail());

  //   $user = User::findOrFail($request->route('id'));

  //   // ID や hash が正しいか確認
  //   if (!hash_equals((string) $request->route('hash'), sha1($user->getEmailForVerification()))) {
  //       return response()->json(['message' => '不正な認証リンクです'], 403);
  //   }

  //   if ($request->user()->hasVerifiedEmail()) {
  //     return response()->json(['message' => 'Already verified']);
  //   }

  //   $request->fulfill(); // ← コレが email_verified_at を更新する！

  //   // return response()->json(['message' => 'Email verified']);

  //   // Sanctumトークンを発行
  //   $token = $user->createToken('email-verify')->plainTextToken;

  //   return response()->json([
  //       'message' => 'メールアドレスを確認しました',
  //       'token' => $token,
  //       'user' => $user
  //   ]);
  // }

  // public function verification(EmailVerificationRequest $request): RedirectResponse
  // {		
  // 	/** @var User $user */
  // 	$user = $request->user();

  // 	if ($user->hasVerifiedEmail()) {
  // 		return redirect()->intended(RouteServiceProvider::HOME.'?verified=1');
  // 	}

  // 	// email_verified_atカラムの更新
  // 	if ($user->markEmailAsVerified()) {
  // 		event(new Verified($user));
  // 	}

  // 	return redirect()->intended(RouteServiceProvider::HOME.'?verified=1');
  // }

  // public function verification(EmailVerificationRequest $request)
  // {
  //   $user = $request->user();

  //   if (!$user->hasVerifiedEmail()) {
  //       $user->markEmailAsVerified();
  //       event(new Verified($user));
  //   }

  //   return response()->json(['message' => 'メールアドレスの確認が完了しました']);
  // }


  /**
   * 確認メール再送信画面
   */
  public function resendVerifyEmail(Request $request)
  {
    session()->forget('status');
    return view('auth.verify-email-massage');
  }

  // セッションをリセットしてゲストユーザーとしてホーム画面を開く（メール確認の操作ができなくなってしまった時に、ユーザーが何もできなくなることを防ぐ）
  public function resetAndToHome()
  {
    session()->flush();
    return redirect()->route('home');
  }
}
