<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Purchase;
use Exception;
use Illuminate\Support\Facades\Log;
use App\Http\Requests\PurchaseRequest;


class PurchaseController extends Controller
{
 /**
   * Display a listing of the resource.
   *
   * @return \Illuminate\Http\Response
   */
  // public function index()
  // {
  //   $items = Purchase::with('categories')->get();
  //   return response()->json([
  //     'data' => $items
  //   ], 200);
    
  // }
  public function index(Request $request)
  {
    if ($request->query() == null) {
      $items = Purchase::with('categories')->get();
      return response()->json([
        'data' => $items
      ], 200);
    } else {
      if ($request->query('user_id') ) {
        $items = Purchase::with('categories')->where('user_id', $request->user_id)->get();
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

  /**
   * Store a newly created resource in storage.
   *
   * @param  \Illuminate\Http\PurchaseRequest  $request
   * @return \Illuminate\Http\Response
   */
  public function store(Request $request)
  {
    Log::debug($request);
    try {
      $item = Purchase::create($request->all());
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
   * @param  \App\Models\Purchase  $purchase
   * @return \Illuminate\Http\Response
   */
  public function show($id)
  {
    $item = Purchase::with('categories')->find($id);
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
   * @param  \Illuminate\Http\PurchaseRequest  $request
   * @param  \App\Models\Purchase  $purchase
   * @return \Illuminate\Http\Response
   */
  public function update(Request $request, Purchase $purchase)
  {
    $update = [
      'content' => $request->content,
    ];

    try {
      $item = Purchase::where('id', $purchase->id)->update($update);
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
   * @param  \App\Models\Prodcut  $purchase
   * @return \Illuminate\Http\Response
   */
  public function destroy(Purchase $purchase)
  {
    try {
      $item = Purchase::where('id', $purchase->id)->delete();
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
}
