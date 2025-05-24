<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Favorite;
use Exception;
use Illuminate\Support\Facades\Log;

class FavoriteController extends Controller
{
  public function getFavorites(Request $request)
  {
    try {
      $user_id = $request->user()->id;
      $items = Favorite::where('user_id', $user_id)->get();
      return response()->json([
        'data' => $items
      ], 200);
    } catch (Exception $err) {
      return response()->json([
        'error' => $err,
      ], 400);
    }
  }

  public function showFavorites(Request $request)
  {
    try {
      $user_id = $request->user()->id;
      $isFavorite = Favorite::where('user_id', $user_id)->where('product_id', $request->product_id)->exists();
      return response()->json([
        'is_favorite' => $isFavorite == 1
      ], 200);
    } catch (Exception $err) {
      return response()->json([
        'error' => $err,
      ], 400);
    }
  }

  public function invertFavorite(Request $request)
  {
    $user_id = $request->user()->id;
    $target = Favorite::where('user_id', $user_id)->where('product_id', $request->product_id)->first();
    if ($target) {
      // レコードがある(すでにいいねになっていいる)ときは、このレコードを削除(いいねを取り消す)
      $target->delete();
      return response()->json([
        'is_favorite' => false
      ], 201);
    } else {
      // レコードがない(いいねをしていない)ときは、レコードを作成(いいねする)
      $data = ['user_id' => $user_id, 'product_id' => $request->product_id];
      Favorite::create($data);
      return response()->json([
        'is_favorite' => true
      ], 201);
    }
  }

  public function countFavorites($product_id)
  {
    $count = Favorite::where('product_id', $product_id)->count();
    $data = ['count' => $count];
    return response()->json([
      'data' => $data
    ], 200);
  }
}
