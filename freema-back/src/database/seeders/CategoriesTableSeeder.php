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
      "ファッション",   // id=1
      "家電",     
      "インテリア",       
      "レディース",        
      "メンズ",  
      "コスメ",
      "本",
      "ゲーム",
      "スポーツ",
      "キッチン",
      "ハンドメイド",
      "アクセサリー",
      "おもちゃ",
      "ベビー・キッズ",
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
