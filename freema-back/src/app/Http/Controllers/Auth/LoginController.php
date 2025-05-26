<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class LoginController extends Controller
{
  public function login(Request $request)
  {
    $request->validate([
      'email' => 'required|email|max:255',
      'password' => 'required|max:255'
    ]);

    $user = User::where('email', $request->email)->first();

    if (!$user || !Hash::check($request->password, $user->password)) {
      return response()->json(['message' => 'Invalid credentials'], 401);
    }

    $token = $user->createToken('auth_token')->plainTextToken;
    return response()->json([
      'access_token' => $token,
      'token_type' => 'Bearer',
      'user' => $user
    ]);
  }
}
