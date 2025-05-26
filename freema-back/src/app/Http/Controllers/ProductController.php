<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Product;
use Exception;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class ProductController extends Controller
{
  use AuthorizesRequests;
  public function __construct()
  {
    $this->middleware('auth:sanctum')->except(['index', 'show']);
  }

  public function index()
  {
    try {
      $items = Product::with('categories')->withCount('favorites')->withExists('purchases')->get();
      return response()->json([
        'data' => $items
      ], 200);
    } catch (Exception $err) {
      return response()->json([
        'error' => $err,
      ], 400);
    }
  }

  public function store(Request $request)
  {
    try {
      $data = $request->all();
      $data += ['user_id' =>  $request->user()->id];
      $item = Product::create($data);
      return response()->json([
        'data' => $item
      ], 201);
    } catch (Exception $err) {
      return response()->json([
        'error' => $err,
      ], 400);
    }
  }

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

  public function update(Request $request, Product $product)
  {
    if ($product->user_id !== $request->user()->id) {
      return response()->json([
        'success' => false,
        'message' => 'Unauthorized',
      ], 403);
    }

    $update = [
      'content' => $request->content,
    ];

    try {
      $product->update($update);

      return response()->json([
        'message' => 'Updated successfully',
      ], 200);
    } catch (Exception $err) {
      return response()->json([
        'error' => $err->getMessage(),
      ], 400);
    }
  }

  public function destroy(Request $request, Product $product)
  {
    try {
      // 所有者チェック
      if ($product->user_id !== $request->user()->id) {
        return response()->json([
          'success' => false,
          'message' => 'Unauthorized',
        ], 403);
      }

      $product->delete();

      return response()->json([
        'success' => true,
        'message' => 'Deleted successfully',
      ], 200);
    } catch (Exception $err) {
      return response()->json([
        'error' => $err->getMessage(),
      ], 400);
    }
  }
}
