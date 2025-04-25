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
        'brand' => 'ブランド',
        'price' => '15000',
        'content' => 'スタイリッシュなデザインのメンズ腕時計',
        'img_filename' => 'defaultImages/Armani+Mens+Clock.jpg',
        'condition_index' => 1,
        'status_index' => 1,
      ],
      [
        'user_id' => 2,
        'name' => 'HDD',
        'brand' => 'ブランド',
        'price' => '5000',
        'content' => '高速で信頼性の高いハードディスク',
        'img_filename' => 'defaultImages/HDD+Hard+Disk.jpg',
        'condition_index' => 1,
        'status_index' => 1,
      ],
      [
        'user_id' => 1,
        'name' => '玉ねぎ3束',
        'brand' => 'ブランド',
        'price' => '300',
        'content' => '新鮮な玉ねぎ3束のセット',
        'img_filename' => 'defaultImages/iLoveIMG+d.jpg',
        'condition_index' => 1,
        'status_index' => 1,
      ],
      [
        'user_id' => 1,
        'name' => '革靴',
        'brand' => 'ブランド',
        'price' => '4000',
        'content' => 'クラシックなデザインの革靴',
        'img_filename' => 'defaultImages/Leather+Shoes+Product+Photo.jpg',
        'condition_index' => 1,
        'status_index' => 1,
      ],
      [
        'user_id' => 1,
        'name' => 'ノートPC',
        'brand' => 'ブランド',
        'price' => '45000',
        'content' => '高性能なノートパソコン',
        'img_filename' => 'defaultImages/Living+Room+Laptop.jpg',
        'condition_index' => 1,
        'status_index' => 1,
      ],
      [
        'user_id' => 1,
        'name' => 'マイク',
        'brand' => 'ブランド',
        'price' => '8000',
        'content' => '高音質のレコーディング用マイク',
        'img_filename' => null,
        'condition_index' => 1,
        'status_index' => 1,
      ],
      [
        'user_id' => 2,
        'name' => 'ショルダーバッグ',
        'brand' => 'ブランド',
        'price' => '3500',
        'content' => 'おしゃれなショルダーバッグ',
        'img_filename' => null,
        'condition_index' => 1,
        'status_index' => 1,
      ],
      [
        'user_id' => 2,
        'name' => 'タンブラー',
        'brand' => 'ブランド',
        'price' => '500',
        'content' => '使いやすいタンブラー',
        'img_filename' => null,
        'condition_index' => 1,
        'status_index' => 1,
      ],
      [
        'user_id' => 2,
        'name' => 'コーヒーミル',
        'brand' => 'ブランド',
        'price' => '4000',
        'content' => '手動のコーヒーミル',
        'img_filename' => null,
        'condition_index' => 1,
        'status_index' => 1,
      ],
      [
        'user_id' => 2,
        'name' => 'メイクセット',
        'brand' => 'ブランド',
        'price' => '2500',
        'content' => '便利なメイクアップセット',
        'img_filename' => null,
        'condition_index' => 1,
        'status_index' => 1,
      ],
    ];

    $data = [];
    foreach ($params as $param) {
      // $exists = (
      //     Product::where('user_id', $param['user_id'])
      //         -> where('name', $param['name'])
      //         -> exists()
      // );

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
