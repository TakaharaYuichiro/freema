<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ImageUploadController extends Controller
{
  public function upload(Request $request)
  {
    $request->validate([
      'image' => 'required|image|max:2048',
    ]);

    $path = $request->file('image')->store('images/uploads', 'public');
    $shortPath = Str::after($path, 'images/');

    return response()->json([
      'url' => asset('storage/' . $path),
      'path' => $shortPath,
    ]);
  }
}
