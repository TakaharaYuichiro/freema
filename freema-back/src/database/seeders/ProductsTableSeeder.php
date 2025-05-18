<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Product;
use DateTime;

class ProductsTableSeeder extends Seeder
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
        'user_id' => 2,
        'name' => '腕時計',
        'brand' => '',
        'price' => '15000',
        'content' => 'スタイリッシュなデザインのメンズ腕時計',
        'img_filename' => 'defaultImages/Armani+Mens+Clock.jpg',
        'condition_index' => 1,
      ],
      [
        'user_id' => 2,
        'name' => 'HDD',
        'brand' => '',
        'price' => '5000',
        'content' => '高速で信頼性の高いハードディスク',
        'img_filename' => 'defaultImages/HDD+Hard+Disk.jpg',
        'condition_index' => 2,
      ],
      [
        'user_id' => 1,
        'name' => '玉ねぎ3束',
        'brand' => '',
        'price' => '300',
        'content' => '新鮮な玉ねぎ3束のセット',
        'img_filename' => 'defaultImages/iLoveIMG+d.jpg',
        'condition_index' => 3,
      ],
      [
        'user_id' => 1,
        'name' => '革靴',
        'brand' => '',
        'price' => '4000',
        'content' => 'クラシックなデザインの革靴',
        'img_filename' => 'defaultImages/Leather+Shoes+Product+Photo.jpg',
        'condition_index' => 4,
      ],
      [
        'user_id' => 1,
        'name' => 'ノートPC',
        'brand' => '',
        'price' => '45000',
        'content' => '高性能なノートパソコン',
        'img_filename' => 'defaultImages/Living+Room+Laptop.jpg',
        'condition_index' => 1,
      ],
      [
        'user_id' => 1,
        'name' => 'マイク',
        'brand' => '',
        'price' => '8000',
        'content' => '高音質のレコーディング用マイク',
        'img_filename' => 'defaultImages/Music+Mic+4632231.jpg',
        'condition_index' => 2,
      ],
      [
        'user_id' => 2,
        'name' => 'ショルダーバッグ',
        'brand' => '',
        'price' => '3500',
        'content' => 'おしゃれなショルダーバッグ',
        'img_filename' => 'defaultImages/Purse+fashion+pocket.jpg',
        'condition_index' => 3,
      ],
      [
        'user_id' => 2,
        'name' => 'タンブラー',
        'brand' => '',
        'price' => '500',
        'content' => '使いやすいタンブラー',
        'img_filename' => 'defaultImages/Tumbler+souvenir.jpg',
        'condition_index' => 4,
      ],
      [
        'user_id' => 2,
        'name' => 'コーヒーミル',
        'brand' => '',
        'price' => '4000',
        'content' => '手動のコーヒーミル',
        'img_filename' => 'defaultImages/Waitress+with+Coffee+Grinder.jpg',
        'condition_index' => 1,
      ],
      [
        'user_id' => 2,
        'name' => 'メイクセット',
        'brand' => '',
        'price' => '2500',
        'content' => '便利なメイクアップセット',
        'img_filename' => 'defaultImages/Makeup_set.jpg',
        'condition_index' => 2,
      ],
    ];

    $data = [];
    foreach ($params as $param) {
      $exists = (
        Product::where('name', $param['name'])
        ->exists()
      );

      if (!$exists) {
        $param['created_at'] =  new DateTime();
        $param['updated_at'] =  new DateTime();
        $data[] = $param;
      }
    }
    DB::table('products')->insert($data);
  }
}
