<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Product;
use Exception;
use Illuminate\Support\Facades\Log;
use App\Http\Requests\ProductRequest;


class ProductController extends Controller
{
  /**
   * Display a listing of the resource.
   *
   * @return \Illuminate\Http\Response
   */
  public function index(Request $request)
  {
    try {
      if ($request->has('except_user_id')) {
        $items = Product::with('categories')->where('user_id', '!=', $request->except_user_id)->withCount('favorites')->withExists('purchases')->get();
        return response()->json([
          'data' => $items
        ], 200);
      } else if ($request->has('user_id')) {
        $items = Product::with('categories')->where('user_id', $request->user_id)->withCount('favorites')->withExists('purchases')->get();
          return response()->json([
            'data' => $items
          ], 200);
      } else {
        $items = Product::with('categories')->withCount('favorites')->withExists('purchases')->get();
        return response()->json([
          'data' => $items
        ], 200);
      }
    } catch (Exception $err) {
      return response()->json([
        'error' => $err,
      ], 400);
    }
  }

  /**
   * Store a newly created resource in storage.
   *
   * @param  \Illuminate\Http\ProductRequest  $request
   * @return \Illuminate\Http\Response
   */
  public function store(Request $request)
  {
    try {
      $item = Product::create($request->all());
      return response()->json([
        'data' => $item
      ], 201);
    } catch (Exception $err) {
      return response()->json([
        'error' => $err,
      ], 400);
    }
  }

  /**
   * Display the specified resource.
   *
   * @param  \App\Models\Product  $product
   * @return \Illuminate\Http\Response
   */
  public function show($id)
  {
    $item = Product::with('categories')->withExists('purchases')->find($id);
    if ($item) {
      return response()->json([
        'data' => $item
      ], 200);
    } else {
      return response()->json([
        'message' => 'Not found',
      ], 404);
    }
  }

  /**
   * Update the specified resource in storage.
   *
   * @param  \Illuminate\Http\ProductRequest  $request
   * @param  \App\Models\Product  $product
   * @return \Illuminate\Http\Response
   */
  public function update(Request $request, Product $product)
  {
    $update = [
      'content' => $request->content,
    ];

    try {
      $item = Product::where('id', $product->id)->update($update);
      if ($item) {
        return response()->json([
          'message' => 'Updated successfully',
        ], 200);
      } else {
        return response()->json([
          'error' => 'Not found',
        ], 404);
      }
    } catch (Exception $err) {
      return response()->json([
        'error' => $err,
      ], 400);
    }
  }

  /**
   * Remove the specified resource from storage.
   *
   * @param  \App\Models\Prodcut  $product
   * @return \Illuminate\Http\Response
   */
  public function destroy(Product $product)
  {
    try {
      $item = Product::where('id', $product->id)->delete();
      if ($item) {
        return response()->json([
          'message' => 'Deleted successfully',
        ], 200);
      } else {
        return response()->json([
          'message' => 'Not found',
        ], 404);
      }
    } catch (Exception $err) {
      return response()->json([
        'error' => $err,
      ], 400);
    }
  }

  public function getPurchasedProducts($user_id)
  {
    try {
      $items = Product::whereIn('id', function ($query) use ($user_id) {
        $query->select('product_id')
          ->from('purchases')
          ->where('user_id', $user_id);
      })->withExists('purchases')->get();
      return response()->json([
        'data' => $items
      ], 200);
    } catch (Exception $err) {
      return response()->json([
        'error' => $err,
      ], 400);
    }
  }

  // public function getProductsExceptMine($user_id)
  // {
  //   try {
  //     $items = Product::with('categories')->where('user_id', '!=', $user_id)->withExists('purchases')->get();
  //     return response()->json([
  //       'data' => $items
  //     ], 200);
  //   } catch (Exception $err) {
  //     return response()->json([
  //       'error' => $err,
  //     ], 400);
  //   }
  // }
}
