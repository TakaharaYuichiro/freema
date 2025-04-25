<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Evaluation;
use App\Models\User;
use Exception;
use Illuminate\Support\Facades\Log;


class EvaluationController extends Controller
{
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
      if ($request->query('product_id') ) {
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
   * @param  \Illuminate\Http\TodoRequest  $request
   * @return \Illuminate\Http\Response
   */
  public function store(Request $request)
  {
    try {
      $item = Evaluation::create($request->all());
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
   * @param  \App\Models\Todo  $todo
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
   * @param  \Illuminate\Http\TodoRequest  $request
   * @param  \App\Models\Todo  $todo
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
   * @param  \App\Models\Todo  $todo
   * @return \Illuminate\Http\Response
   */
  public function destroy(Evaluation $evaluation)
  {
    try {
      $item = Evaluation::where('id', $evaluation->id)->delete();
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
