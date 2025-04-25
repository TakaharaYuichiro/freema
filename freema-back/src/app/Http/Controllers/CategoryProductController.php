<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\CategoryProduct;
use Exception;


class CategoryProductController extends Controller
{
 /**
   * Display a listing of the resource.
   *
   * @return \Illuminate\Http\Response
   */
  // public function index()
  // {
  //   $items = CategoryProduct::all();
  //   return response()->json([
  //     'data' => $items
  //   ], 200);
  // }

  /**
   * Store a newly created resource in storage.
   *
   * @param  \Illuminate\Http\TodoRequest  $request
   * @return \Illuminate\Http\Response
   */
  public function store(Request $request)
  {
    try {
      $item = CategoryProduct::create($request->all());
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
  // public function show($id)
  // {
  //   $item = CategoryProduct::find($id);
  //   if ($item) {
  //     return response()->json([
  //       'data' => $item
  //     ], 200);
  //   } else {
  //     return response()->json([
  //       'message' => 'Not found',
  //     ], 404);
  //   }
  // }

  /**
   * Update the specified resource in storage.
   *
   * @param  \Illuminate\Http\TodoRequest  $request
   * @param  \App\Models\Todo  $todo
   * @return \Illuminate\Http\Response
   */
  // public function update(Request $request, CategoryProduct $category_products)
  // {
  //   $update = [
  //     'content' => $request->content,
  //   ];

  //   try {
  //     $item = CategoryProduct::where('id', $category_products->id)->update($update);
  //     if ($item) {
  //       return response()->json([
  //         'message' => 'Updated successfully',
  //       ], 200);
  //     } else {
  //       return response()->json([
  //         'error' => 'Not found',
  //       ], 404);
  //     }
  //   } catch (Exception $err) {
  //     return response()->json([
  //       'error' => $err,
  //     ], 400);
  //   }
  // }

  /**
   * Remove the specified resource from storage.
   *
   * @param  \App\Models\CategoryProduct  $category_products
   * @return \Illuminate\Http\Response
   */
  public function destroy(CategoryProduct $category_products)
  {
    try {
      $item = CategoryProduct::where('product_id', $category_products->product_id)
        ->where('category_id', $category_products->category_id)
        ->delete();
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
