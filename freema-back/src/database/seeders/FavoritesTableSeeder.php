<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Favorite;
use DateTime;

class FavoritesTableSeeder extends Seeder
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
        'user_id' => 1,
        'product_id' => 1,
      ],
      [
        'user_id' => 2,
        'product_id' => 2,
      ],
      [
        'user_id' => 2,
        'product_id' => 1,
      ],
      [
        'user_id' => 3,
        'product_id' => 1,
      ],
    ];

    foreach ($params as $param) {
      $exists = (
        Favorite::where('user_id', $param['user_id'])
        ->where('product_id', $param['product_id'])
        ->exists()
      );

      if (!$exists) {
        $param['created_at'] =  new DateTime();
        $param['updated_at'] =  new DateTime();
        DB::table('favorites')->insert($param);
      }
    }
  }
}
