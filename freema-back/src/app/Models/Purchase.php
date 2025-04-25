<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Purchase extends Model
{
  use HasFactory;

  protected $fillable = [
    'user_id',
    'product_id',
    'zipcode',
    'address',
    'building',
    'method_index',
  ];

  // public function users()
  // {
  //   return $this->belongsTo(User::class);
  // }

  // public function products()
  // {
  //   return $this->belongsTo(Product::class);
  // }

  public function user()
  {
    return $this->belongsTo(User::class);
  }

  public function product()
  {
    return $this->belongsTo(Product::class);
  }
}
