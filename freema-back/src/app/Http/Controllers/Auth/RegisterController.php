<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class RegisterController extends Controller
{
  public function register(Request $request)
  {
    $request->validate([
      'name' => 'required|string|max:255',
      'email' => 'required|email|max:255|unique:users,email',
      'password' => 'required|string|min:8|max:255|confirmed',
    ]);

    $user = User::create([
      'name' => $request->name,
      'email' => $request->email,
      'password' => Hash::make($request->password),
    ]);

    // メール認証メール送信
    $user->sendEmailVerificationNotification();

    // Sanctum トークン発行
    $token = $user->createToken('register-token')->plainTextToken;

    // 確認メール再送対応のためトークンを返す。この時点では仮登録なのでユーザー情報は返さないで良いはず
    return response()->json([
      'message' => 'ユーザーを仮登録しました。確認メールをご確認ください。',
      'token'   => $token,
    ], 201);
  }
}
