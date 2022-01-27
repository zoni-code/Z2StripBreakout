# Z2StripBreakout

Flash時代に存在した脱衣ブロック崩しをリスペクトしつつ、現代的な使い勝手を持った脱衣ブロック崩しを実現するプロジェクトです。

## ゴール

- スマホ対応 
- レスポンシブ対応
- WebUIによる生成ツールの提供

## 利用方法

### マウント位置の追加
```
<div id="stbo-app"></div>
```

### スクリプトの読み込み
```
<script type="text/javascript" src="./app.js"></script>
```

### 初期化と開始

```
<script type="text/javascript">
  window.instance = StripBreakout(document.getElementById("stbo-app"), (isMobileOs) => {
    return {
      stages: [
        {
          image: {
            type: "blockimage", // 背景 + 前景 + ブロック画像
            foreground: "./assets/f.png",
            background: "./assets/b.png",
            block: "./assets/block.png",
          }
        },
        {
          image: {
            type: "autoblock", // 背景 + 前景 + 差分ブロック
            foreground: "./assets/f.png",
            background: "./assets/b.png",
          }
        },
        {
          image: {
            type: "foregroundasblock", // 背景 + 前景
            foreground: "./assets/blockf.png",
            background: "./assets/b.png",
          }
        },
      ],
    };
  });
</script>
```

## 高度な設定

[設定ファイル](https://github.com/zoni-code/Z2StripBreakout/blob/main/src/app/game/Config.ts) のフォーマットに従って自由に設定を変更できます。

## TODO

- ゲーム性の向上
  - アイテムやエフェクトの追加
- UI上で指定できるオプションの拡大
- 自動ブロック生成の精度向上
- 画像の難読化
- テスト
- ライブラリのCDNへのパブリッシュ

# Attribution

音：[フリー効果音素材 くらげ工匠](http://www.kurage-kosho.info/)
