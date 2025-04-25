<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Symfony\Component\ErrorHandler\Debug;

class RegisterController extends Controller
{
  public function register(Request $request)
  {
    Log::debug('RegisterController test');
    $request->validate([
      'name' => 'required|string|max:255',
      'email' => 'required|email|unique:users,email',
      'password' => 'required|string|min:8|confirmed',
    ]);

    $user = User::create([
      'name' => $request->name,
      'email' => $request->email,
      'password' => Hash::make($request->password),
    ]);

    // $token = $user->createToken('auth_token')->plainTextToken;

    // return response()->json([
    //   'access_token' => $token,
    //   'token_type' => 'Bearer',
    //   'user' => $user
    // ]);

    // メール認証メール送信
    $user->sendEmailVerificationNotification();

    // return response()->json([
    //     'message' => '登録が完了しました。確認メールを送信しました。',
    // ]);

    // Sanctum トークン発行
    $token = $user->createToken('register-token')->plainTextToken;

    // 確認メール再送対応のためトークンを返す。この時点では仮登録なのでユーザー情報は返さないで良いはず
    return response()->json([
      'message' => 'ユーザーを仮登録しました。確認メールをご確認ください。',
      // 'user'    => $user,
      'token'   => $token,
    ], 201);
  }
}
