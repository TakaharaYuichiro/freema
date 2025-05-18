import type { Category } from '~/types/category'
const params = [
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

export const mockCategories: Category[] = params.map((name, index) => ({
  id: index + 1,
  name,
}));
