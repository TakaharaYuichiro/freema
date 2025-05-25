<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Stripe\Stripe;
use Stripe\Charge;
use Stripe\PaymentIntent;
use Stripe\Exception\CardException;
use Stripe\Exception\InvalidRequestException;
use App\Models\Purchase;
use Exception;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
  // Stripeカード払いのAPI用メソッド
  public function payment(Request $request)
  {
    Stripe::setApiKey(config('stripe.stripe_secret_key'));
    try {
      $charge = Charge::create([
        'source' => $request->stripeToken,
        'amount' => $request->total_price,
        'currency' => 'jpy',
      ]);

      $purchase = Purchase::find($request->purchase_id);
      $data = [
        'charge_id' => $charge->id,
        'paid_at' => Carbon::now()
      ];
      $purchase->update($data);
      return response()->json([
        'success' => true
      ], 200);
    } catch (CardException $e) {
      Log::debug('CardException'. $e->getMessage());
      return response()->json([
        'error' => '決済に失敗しました。他のカードをお試しください。'
      ], 400);
    } catch (InvalidRequestException $e) {
      Log::debug('InvalidRequestException '. $e->getMessage());
      return response()->json([
        'error' => '決済に失敗しました。'
      ], 400);
    } catch (Exception $e) {
      Log::debug('Other Exception'. $e->getMessage());
      return response()->json([
        'error' => '決済に失敗しました。'
      ], 400);
    }
  }

  // Stripeコンビニ払いのAPI用メソッド
  public function konbiniPayment(Request $request)
  {
    if ($request->total_price < 120 || $request->total_price > 300000) {
      return response()->json([
        'error' => 'コンビニ決済は120円以上、300,000円以下でご利用ください。',
      ], 400);
    }

    Stripe::setApiKey(config('stripe.stripe_secret_key'));
    try {
      $paymentIntent = PaymentIntent::create([
        'amount' => $request->total_price,
        'currency' => 'jpy',
        'payment_method_types' => ['konbini'],
        'payment_method_options' => [
          'konbini' => [
            'product_description' => 'テスト商品の説明',
            'expires_after_days' => 3,
          ],
        ],
        'confirmation_method' => 'automatic',
        'confirm' => true,   
        'payment_method_data' => [
          'type' => 'konbini',
          'billing_details' => [
            'name' => $request->name ?? 'テスト太郎',  // ★ ユーザーの名前
            'email' => $request->email ?? 'test@example.com', // ★ メールアドレス
            'phone' => $request->phone ?? '09012345678', // ★ 電話番号
          ],
        ],
        'description' => '購入ID: ' . $request->purchase_id,
        'metadata' => [
          'purchase_id' => $request->purchase_id,
        ],
      ]);

      // purchaseテーブルを更新。charge_idの列を借用して、paymentIntentIdを記録
      $purchase = Purchase::find($request->purchase_id);
      if ($purchase) {
        $data = [
          'charge_id' => $paymentIntent->id,
        ];
        $purchase->update($data);
      }

      return response()->json([
        'payment_intent_id' => $paymentIntent->id,
        'client_secret' => $paymentIntent->client_secret,
        'payment_info' => $paymentIntent->next_action->konbini_display_details ?? null,
      ], 200);
    } catch (\Exception $e) {
      Log::error('Stripeエラー: ' . $e->getMessage());
      return response()->json([
        'error' => $e->getMessage(),
      ], 400);
    }
  }

  // 【デモ用】ユーザーがブラウザ上で完了をクリックすることで、コンビニ払いを完了したことにするためのAPI用メソッド
  public function konbiniPaymentComplete(Request $request)
  {
    Stripe::setApiKey(config('stripe.stripe_secret_key'));
    try {
      // まずは、purchase_idに紐づけられているuser_idとpayment_idの整合をチェック
      $user_id = $request->user()->id;
      $payment_id = $request->payment_id;
      $purchase = Purchase::find($request->purchase_id);
      if ($purchase) {
        if (($purchase->user_id == $user_id) && ($purchase->charge_id == $payment_id)) {
          // payment_idに対応するデータがStripe上にあるかどうかでチェック（デモ用のためデータ内容の確認は省略。データがなければ例外発生）
          $paymentIntent = PaymentIntent::retrieve($payment_id);

          // 全てのチェックを通過したら、purchaseテーブルのレコードを支払い済みにする
          $data = [
            'paid_at' => Carbon::now(),
          ];
          $purchase->update($data);
          return response()->json([
            'success' => true,
          ], 200);
        }
      }
    } catch (\Exception $e) {
      return response()->json([
        'error' => $e->getMessage(),
      ], 400);
    }

    // データチェックを通過できなかった時のレスポンス
    return response()->json(['error' => 'エラー', 'message' => '支払いに失敗しました'], 400);
  }
}
