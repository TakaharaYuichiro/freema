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

Route::post('/register', [RegisterController::class, 'register']);
Route::post('/email/verification-notification', [EmailVerificationController::class, 'notification'])->middleware('auth:sanctum');
Route::get('/email/verify/{id}/{hash}', [EmailVerificationController::class, 'verification'])->middleware(['signed', 'auth:sanctum'])->name('verification.verify');
Route::post('/email/resend', [EmailVerificationController::class, 'resend'])->middleware(['auth:sanctum']);
Route::post('/login', [LoginController::class, 'login']);

Route::apiResource('/users', UserController::class)->middleware(['auth:sanctum']);
Route::apiResource('/products', ProductController::class); // auth:sanctumのmiddlewareは、Controller側で制御
Route::apiResource('/purchases', PurchaseController::class)->middleware(['auth:sanctum']);
Route::apiResource('/categories', CategoryController::class); // auth:sanctumのmiddlewareは、Controller側で制御
Route::apiResource('/evaluations', EvaluationController::class);  // auth:sanctumのmiddlewareは、Controller側で制御

Route::post('/category-products', [CategoryProductController::class, 'store'])->middleware('auth:sanctum');

Route::get('/get-favorites', [FavoriteController::class, 'getFavorites'])->middleware('auth:sanctum');
Route::get('/get-favorites/{product_id}', [FavoriteController::class, 'showFavorites'])->middleware('auth:sanctum');
Route::get('/count-favorites/{product_id}', [FavoriteController::class, 'countFavorites']);
Route::post('/invert-favorite', [FavoriteController::class, 'invertFavorite'])->middleware('auth:sanctum');

Route::post('/upload-image', [ImageUploadController::class, 'upload'])->middleware('auth:sanctum');

Route::post('/card-payment', [PaymentController::class, 'payment'])->middleware('auth:sanctum');
Route::post('/konbini-payment', [PaymentController::class, 'konbiniPayment'])->middleware('auth:sanctum');
Route::post('/konbini-payment/complete', [PaymentController::class, 'konbiniPaymentComplete'])->middleware('auth:sanctum');

