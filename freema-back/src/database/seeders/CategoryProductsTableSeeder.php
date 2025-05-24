<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\CategoryProduct;
use DateTime;

class CategoryProductsTableSeeder extends Seeder
{
  /**
   * Run the database seeds.
   *
   * @return void
   */
  public function run()
  {
    $params = [
      [
        'product_id' => 1,
        'category_id' => 1,
      ],
      [
        'product_id' => 1,
        'category_id' => 5,
      ],
      [
        'product_id' => 2,
        'category_id' => 2
      ],
      [
        'product_id' => 4,
        'category_id' => 1,
      ],
      [
        'product_id' => 4,
        'category_id' => 5,
      ],
      [
        'product_id' => 5,
        'category_id' => 2,
      ],
      [
        'product_id' => 6,
        'category_id' => 2,
      ],
      [
        'product_id' => 7,
        'category_id' => 1,
      ],
      [
        'product_id' => 7,
        'category_id' => 4,
      ],
      [
        'product_id' => 8,
        'category_id' => 10,
      ],
      [
        'product_id' => 9,
        'category_id' => 10,
      ],
      [
        'product_id' => 10,
        'category_id' => 1,
      ],
      [
        'product_id' => 10,
        'category_id' => 4,
      ],
    ];

    $data = [];
    foreach ($params as $param) {
      $exists = (
        CategoryProduct::where('product_id', $param['product_id'])
        ->where('category_id', $param['category_id'])
        ->exists()
      );

      if (!$exists) {
        $param['created_at'] =  new DateTime();
        $param['updated_at'] =  new DateTime();
        $data[] = $param;
      }
    }
    DB::table('category_products')->insert($params);
  }
}
