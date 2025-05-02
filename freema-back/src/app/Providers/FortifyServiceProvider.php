<?php

namespace App\Providers;

use Illuminate\Http\Request;
use Illuminate\Support\ServiceProvider;
use Laravel\Fortify\Fortify;
use Laravel\Fortify\Contracts\LogoutResponse;
use Illuminate\Support\Facades\Hash;

class FortifyServiceProvider extends ServiceProvider
{
  /**
   * Register any application services.
   */
  public function register(): void
  {
    // Laravel 8のログアウト後のリダイレクト先を設定
    // https://zenn.dev/moroshi/articles/d27ad14c5f22af
    $this->app->instance(LogoutResponse::class, new class implements LogoutResponse {
      public function toResponse($request)
      {
        return redirect('/');
      }
    });
  }

  /**
   * Bootstrap any application services.
   */
  public function boot(): void
  {
    Fortify::loginView(fn() => abort(404)); // Blade不要なら404
    Fortify::registerView(fn() => abort(404));

    Fortify::authenticateUsing(function (Request $request) {
      $user = \App\Models\User::where('email', $request->email)->first();

      if ($user && Hash::check($request->password, $user->password)) {
        return $user;
      }
    });
  }
}
