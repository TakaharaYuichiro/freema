<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Product;

class Category extends Model
{
  use HasFactory;

  protected $fillable = [
    'user_id',
    'product_id',
    'score',
    'comment',
  ];

  public function users()
  {
    return $this->belongsTo(User::class);
  }

  public function products()
  {
    return $this->belongsToMany(Product::class, 'category_products', 'category_id', 'product_id');
  }
}
