<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
  use HasFactory;

  protected $fillable = [
    'user_id',
    'name',
    'brand',
    'price',
    'content',
    'img_filename',
    'condition_index',
  ];

  protected $casts = [
    'brand' => 'string',
  ];

  public function users()
  {
    return $this->belongsTo(User::class);
  }

  public function categories()
  {
    return $this->belongsToMany(Category::class, 'category_products', 'product_id', 'category_id');
  }

  public function purchases()
  {
    return $this->hasMany(Purchase::class);
  }

  public function favorites()
  {
    return $this->hasMany(Favorite::class);
  }
}
