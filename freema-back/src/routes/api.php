<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
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
use App\Http\Controllers\PaymentController;

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

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
  return response()->json($request->user());
});

Route::post('/login', [LoginController::class, 'login']);
Route::post('/register', [RegisterController::class, 'register']);
Route::post('/email/verification-notification', [EmailVerificationController::class, 'notification'])->middleware('auth:sanctum');
Route::get('/email/verify/{id}/{hash}', [EmailVerificationController::class, 'verification'])->middleware(['signed', 'auth:sanctum'])->name('verification.verify');
Route::post('/email/resend', [EmailVerificationController::class, 'resend'])->middleware(['auth:sanctum']);

Route::apiResource('/users', UserController::class)->middleware(['auth:sanctum']);
Route::apiResource('/purchases', PurchaseController::class)->middleware(['auth:sanctum']);
Route::apiResource('/products', ProductController::class); // auth:sanctumのmiddlewareは、Controller側で制御
Route::apiResource('/categories', CategoryController::class); // auth:sanctumのmiddlewareは、Controller側で制御
Route::apiResource('/evaluations', EvaluationController::class);  // auth:sanctumのmiddlewareは、Controller側で制御

Route::post('category_products', [CategoryProductController::class, 'store']);
Route::delete('category_products', [CategoryProductController::class, 'destroy']);
Route::get('/get_favorites', [FavoriteController::class, 'getFavorites'])->middleware('auth:sanctum');
Route::get('/get_favorites/{product_id}', [FavoriteController::class, 'showFavorites'])->middleware('auth:sanctum');
Route::get('/count_favorites/{product_id}', [FavoriteController::class, 'countFavorites']);
Route::post('/invert_favorite', [FavoriteController::class, 'invertFavorite']);
Route::post('/upload_image', [ImageUploadController::class, 'upload'])->middleware('auth:sanctum');

Route::post('/payment', [PaymentController::class, 'payment'])->middleware('auth:sanctum');
Route::post('/konbini-payment', [PaymentController::class, 'konbiniPayment'])->middleware('auth:sanctum');
Route::post('/konbini-payment/complete', [PaymentController::class, 'konbiniPaymentComplete'])->middleware('auth:sanctum');

