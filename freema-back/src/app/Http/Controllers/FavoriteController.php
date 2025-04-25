<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Favorite;
use Illuminate\Support\Facades\Log;

class FavoriteController extends Controller
{
    public function getFavoriteStates($user_id) {
      // Log::debug("user_id:". $user_id);
      $items = Favorite::where('user_id', $user_id) -> get();
      return response()->json([
        'data' => $items
      ], 200);
    }

    public function setFavoriteStates(Request $request) {
      // Log::debug("user_id:". $user_id);
      $target = Favorite::where('user_id', $request->user_id)->where('product_id', $request->product_id) ->first();
      if ($target) {
        // すでにいいねになっていたら、このレコードを削除
        $target->delete();
        return response()->json([
          'is_favorite' => false
        ], 201);
      } else {
        $data = ['user_id'=>$request->user_id, 'product_id'=>$request->product_id];
        Favorite::create($data);
        return response()->json([
          'is_favorite' => true
        ], 201);
      }

      // return Favorite::where('user_id', $user_id)->get();
    }

    public function countFavorites($product_id) {
      $count = Favorite::where('product_id', $product_id)->count();
      $data = ['count' => $count];
      return response()->json([
        'data' => $data
      ], 200);
    }
}
