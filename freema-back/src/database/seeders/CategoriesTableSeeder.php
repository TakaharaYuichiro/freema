<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Category;
use DateTime;

class CategoriesTableSeeder extends Seeder
{
  /**
   * Run the database seeds.
   *
   * @return void
   */
  public function run()
  {
    $params = [
      "ファッション",   //id=1
      "家電",          //2
      "インテリア",     //3  
      "レディース",     //4
      "メンズ",        //5
      "コスメ",        //6
      "本",           //7
      "ゲーム",        //8
      "スポーツ",       //9
      "キッチン",        //10
      "ハンドメイド",     //11
      "アクセサリー",     //12
      "おもちゃ",        //13
      "ベビー・キッズ",   //14
    ];

    foreach ($params as $param) {
      if (!(Category::where('name', $param)->exists())) {
        DB::table('categories')->insert([
          'name' => $param,
          'created_at' => new DateTime(),
          'updated_at' => new DateTime(),
        ]);
      }
    }
  }
}
