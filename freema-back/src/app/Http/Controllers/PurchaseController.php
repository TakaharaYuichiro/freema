<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Purchase;
use Exception;
use Illuminate\Support\Facades\Log;

class PurchaseController extends Controller
{
  public function index(Request $request)
  {
    if ($request->query() == null) {
      $items = Purchase::with('product')->get();
      return response()->json([
        'data' => $items
      ], 200);
    } else if ($request->has('option')) {
      $option = $request->option;
      if ($option == 'mine') {
        $user_id = $request->user()->id;
        $items = Purchase::with('product')->where('user_id', $user_id)->get();
        return response()->json([
          'data' => $items
        ], 200);
      } else {
        return response()->json([
          'error' => 'query error',
        ], 400);
      }
    }
  }

  public function store(Request $request)
  {
    try {
      $data = $request->all();
      $data += ['user_id' =>  $request->user()->id];
      $item = Purchase::create($data);
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
    $item = Purchase::with('product')->find($id);
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
  
  public function update(Request $request, Purchase $purchase)
  {
    if ($purchase->user_id !== $request->user()->id) {
      return response()->json([
        'success' => false,
        'message' => 'Unauthorized',
      ], 403);
    }

    $update = [
      'content' => $request->content,
    ];

    try {
      $purchase->update($update);

      return response()->json([
        'message' => 'Updated successfully',
      ], 200);
    } catch (Exception $err) {
      return response()->json([
        'error' => $err->getMessage(),
      ], 400);
    }
  }

  public function destroy(Request $request, Purchase $purchase)
  {
    try {
      // 所有者チェック
      if ($purchase->user_id !== $request->user()->id) {
        return response()->json([
          'success' => false,
          'message' => 'Unauthorized',
        ], 403);
      }

      $purchase->delete();

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
