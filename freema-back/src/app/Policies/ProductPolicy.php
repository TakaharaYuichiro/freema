<?php

namespace App\Policies;

use App\Models\Product;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class ProductPolicy
{
  use HandlesAuthorization;

  /**
   * Determine whether the user can view any models.
   *
   * @param  \App\Models\User  $user
   * @return \Illuminate\Auth\Access\Response|bool
   */
  public function viewAny(?User $user)
  {
    return true; // ログインしているユーザー全員が一覧取得可能
  }

  /**
   * Determine whether the user can view the model.
   *
   * @param  \App\Models\User  $user
   * @param  \App\Models\Product  $product
   * @return \Illuminate\Auth\Access\Response|bool
   */
  public function view(?User $user, Product $product)
  {
    return true; // 誰でも見れるなら true 固定、制限するなら条件書く
  }

  /**
   * Determine whether the user can create models.
   *
   * @param  \App\Models\User  $user
   * @return \Illuminate\Auth\Access\Response|bool
   */
  public function create(User $user)
  {
    //
  }

  /**
   * Determine whether the user can update the model.
   *
   * @param  \App\Models\User  $user
   * @param  \App\Models\Product  $product
   * @return \Illuminate\Auth\Access\Response|bool
   */
  public function update(User $user, Product $product)
  {
    return $user->id === $product->user_id; // 投稿者だけ編集可
  }

  /**
   * Determine whether the user can delete the model.
   *
   * @param  \App\Models\User  $user
   * @param  \App\Models\Product  $product
   * @return \Illuminate\Auth\Access\Response|bool
   */
  public function delete(User $user, Product $product)
  {
    return $user->id === $product->user_id; // 投稿者だけ削除可
  }

  /**
   * Determine whether the user can restore the model.
   *
   * @param  \App\Models\User  $user
   * @param  \App\Models\Product  $product
   * @return \Illuminate\Auth\Access\Response|bool
   */
  public function restore(User $user, Product $product)
  {
    //
  }

  /**
   * Determine whether the user can permanently delete the model.
   *
   * @param  \App\Models\User  $user
   * @param  \App\Models\Product  $product
   * @return \Illuminate\Auth\Access\Response|bool
   */
  public function forceDelete(User $user, Product $product)
  {
    //
  }
}
