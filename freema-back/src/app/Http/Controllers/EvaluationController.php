<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Evaluation;
use Exception;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Support\Facades\Log;

class EvaluationController extends Controller
{
  use AuthorizesRequests;
  public function __construct()
  {
    $this->middleware('auth:sanctum')->except(['index', 'show']);
  }

  /**
   * Display a listing of the resource.
   *
   * @return \Illuminate\Http\Response
   */
  public function index(Request $request)
  {
    if ($request->query() == null) {
      $items = Evaluation::with('user:id,name,img_filename')->get();
      return response()->json([
        'data' => $items
      ], 200);
    } else {
      if ($request->query('product_id')) {
        $items = Evaluation::with('user:id,name,img_filename')->where('product_id', $request->product_id)->get();
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
   * @param  \Illuminate\Http\Request  $request
   * @return \Illuminate\Http\Response
   */
  public function store(Request $request)
  {
    try {
      $data = [
        'user_id' =>  $request->user()->id,
        'product_id' => $request->product_id,
        'comment' => $request->comment,
      ];
      $item = Evaluation::create($data);
      // $item = Evaluation::create($request->all());
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
   * @return \Illuminate\Http\Response
   */
  public function show($id)
  {
    $item = Evaluation::with('categories')->find($id);
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
   * @param  \Illuminate\Http\Request  $request
   * @param  \App\Models\Evaluation  $evaluation
   * @return \Illuminate\Http\Response
   */
  public function update(Request $request, Evaluation $evaluation)
  {
    $update = [
      'content' => $request->content,
    ];

    try {
      $item = Evaluation::where('id', $evaluation->id)->update($update);
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
   * @param  \App\Models\Evaluation  $evaluation
   * @return \Illuminate\Http\Response
   */
  public function destroy(Request $request, Evaluation $evaluation)
  {
    try {
      // 所有者チェック
      if ($evaluation->user_id !== $request->user()->id) {
        return response()->json([
          'success' => false,
          'message' => 'Unauthorized',
        ], 403);
      }

      $evaluation->delete();

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
