<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\RegisterdUserController;
use App\Http\Controllers\AuthenticatedSessionController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Auth\EmailVerificationController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\FavoriteController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CategoryProductController;
use App\Http\Controllers\EvaluationController;
use App\Http\Controllers\PurchaseController;
use App\Http\Controllers\ImageUploadController;



/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

// Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
//     return $request->user();
// });
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
  return response()->json($request->user());
});


// ログイン関連のルート
// Route::post('/register',[RegisterdUserController::class,'store']);
// Route::post('/login',[AuthenticatedSessionController::class,'store']);
// Route::post('/logout',[AuthenticatedSessionController::class,'destroy'])->middleware('auth:sanctum');


// Route::post('/login', [LoginController::class, 'login']);
// Route::post('/logout', [LoginController::class, 'logout'])->middleware('auth:sanctum');

Route::post('/login', [LoginController::class, 'login']);
Route::post('/register', [RegisterController::class, 'register']);
Route::post('/email/verification-notification', [EmailVerificationController::class, 'notification'])->middleware('auth:sanctum');
Route::get('/email/verify/{id}/{hash}', [EmailVerificationController::class, 'verification'])
    ->middleware(['signed', 'auth:sanctum'])
    ->name('verification.verify');
// Route::get('/email/verify/{id}/{hash}', [EmailVerificationController::class, 'verification'])
//     ->middleware(['signed'])
//     ->name('verification.verify');
Route::post('/email/resend', function (Request $request) {
  if ($request->user()->hasVerifiedEmail()) {
      return response()->json(['message' => 'すでに確認済みです。'], 400);
  }
  $request->user()->sendEmailVerificationNotification();
  return response()->json(['message' => '確認メールを再送しました。']);
})->middleware(['auth:sanctum']);

Route::apiResource('/users', UserController::class);
Route::apiResource('/products', ProductController::class);
Route::apiResource('/categories', CategoryController::class);
Route::apiResource('/evaluations', EvaluationController::class);
Route::apiResource('/purchases', PurchaseController::class);

Route::get("purchased_products/{user_id}", [ProductController::class, 'getPurchasedProducts']);
// Route::get("products_except_mine/{user_id}", [ProductController::class, 'getProductsExceptMine']);

Route::post('category_products', [CategoryProductController::class, 'store']);
Route::delete('category_products', [CategoryProductController::class, 'destroy']);

Route::get('/getFavoriteStates/{user_id}', [FavoriteController::class, 'getFavoriteStates']);
Route::get('/countFavorites/{product_id}', [FavoriteController::class, 'countFavorites']);
Route::post('/setFavoriteStates', [FavoriteController::class, 'setFavoriteStates']);

Route::post('/upload_image', [ImageUploadController::class, 'upload']);