<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
  /**
   * Seed the application's database.
   *
   * @return void
   */
  public function run()
  {
    $this->call(UsersTableSeeder::class);
    $this->call(ProductsTableSeeder::class);
    $this->call(CategoriesTableSeeder::class);
    $this->call(EvaluationsTableSeeder::class);
    $this->call(FavoritesTableSeeder::class);
    $this->call(CategoryProductsTableSeeder::class);
  }
}
