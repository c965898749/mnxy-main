import { GAssetImpl } from "../../Core/GLoader/GLoader";

export const Res = {
    font: {
        mnpw: 'font/mnpw',
        ysbth: "font/ysbth",
        fzcy: "font/fzcy"

    },
    // spriteframe
    texture: {
        single: 'singleColor',
        map: {
            grid: "frames/views/map/mapGrid",
            quality: 'frames/views/quality',
            material: "frames/views/map/mapMaterial"
        },
        fight: {
            ui: "frames/views/fight",
            vipNum: "frames/views/vipNum",
            describe: "frames/battle/describe"
        },
        hero: {
            hero: 'frames/hero/'
        },
        views: {
            mainUi: "frames/views/mainUi",
            common: "frames/views/common",
            heroDetail: "frames/views/detailsImg",
            homeUI: "frames/views/mainUi",
            skillIcon: "frames/views/skill",
            sign: "frames/views/sign",
            icon: "frames/views/icon",
            tower: "frames/views/tower",
            bless: "frames/views/bless",
            vip: "frames/views/vip",
        }
    },
    bigpic: {
        main: 'bg/main/',
        map: "bg/map/"
    },
    prefab: {
        vw: {
            home: {
                strengthenView: 'main/StrengthenView',
                EquipDetailsCtrl: 'main/EquipDetailsCtrl',
              //  TowerFloorItem: 'main/TowerFloorItem',
              //  TowerCtrl: 'main/TowerCtrl',
                blessCtrl: 'main/BlessCtrl',
                detailsCtrl: 'hero/DetailsCtrl',
                officerCtrl: 'main/OfficerCtrl',
                signInCtrl: 'main/SignInCtrl',
                loadCtrl: "main/LoadCtrl",
                vipCtrl: 'main/VipCtrl',
                vipPage: 'main/VipPage',
                timeLimitGift: 'tip/TimeLimitGift',
                rankView: 'tip/RankView',

                powerUp: 'tip/PowerUp',


                propertyItem: 'main/PropertyItem',
                mainCtrl: "main/MainCtrl",
                recruitCtrl: "main/RecruitCtrl",
                chapterPage: 'main/ChapterPage',
                homeCtrl: "main/HomeCtrl",
                levelCtrl: "main/LevelCtrl",
                levelItem: "main/LevelItem",
                skillPage: 'main/SkillPage',
                currencyFrame: 'common/CurrencyFrame',
                previewCtrl: "common/PreviewCtrl",
                featureCtrl: "main/FeatureCtrl",
                setCtrl: "main/SetCtrl",

                FightDataPreView: "main/FightDataPreView",
                recuitCardItem: "main/RecuitCardItem",
                recuitCardCtrl: "main/RecruitCardCtrl",
                dailyView:"main/DailyView"

           
            },
            store: {
                storeEquipItem: "store/StoreEquipItem",
                storeCtrl: "store/StoreCtrl",
            },
            hero: {
                heroTry: "hero/HeroTryCtrl",
                heroCtrl: "hero/HeroCtrl",
                squadCtrl: "hero/SquadCtrl",
                equipAddCtrl: "hero/EquipAddCtrl",
            },
            fight: {
                fightLayer: "fight/BattleViewCtrl",
                mapLayer: "fight/BtlMapLayer",
                head: "fight/BtlHeroHead",
                battleResult: "fight/BattleResultCtrl",
                battleResultView: "fight/BattleResultView",

                battleReward: "fight/BattleRewardCtrl",
                resultHero: "fight/JXResultHero",
            //    btHeroHurt: "fight/BtHeroHurt",
                fightLayerPut: "fight/BattleViewPut",
                guessLayer:"fight/GuessView",
                ceremonialGiftView:"fight/CeremonialGiftView",
            },
            tip: {
                rewardCtrl: 'tip/RewardCtrl',
                toast: "tip/ToastCtrl",
                moreGame: "tip/MoreGame",
                diacan: "tip/DiaoChanView",
                guessResultView: "tip/GuessResultView",
            }
        },
        item: {
            topUiItem: 'common/TopUiItem',
            officerItem: 'main/OfficerItem',
            boxItem: 'main/BoxItem',
            jxItem: 'common/JXItem',
            skillItem: 'main/SkillItem',

            FightDataItem: 'main/FightDataItem',
            heroCardItem: 'hero/HeroCardItem',
            HeroItem: 'hero/HeroItem',
            guide_item: "guide/GuideNode",
            jxRoadPoint: "fight/JXRoadPoint",
        },
        fight: {
            ArmRole: "fight/ArmRole",

            role: "fight/JXRole",
            head: 'fight/JXRBRoleHead',
            fightFlags: "fight/JXRBFlags",
            roleHead: "fight/RoleHead",
        }
    },

    model: "spine/model/",
    comskills: "dragonBones/comskills",
    animation: {
        kuang: {
            // kuang1: { path: "frames/views/kuangAni1", aniName: 'kuang', prefix: 'K_', numberFix: 4 },
            // kuang2: { path: "frames/views/kuangAni2", aniName: 'kuang', prefix: 'K2_', numberFix: 4 },
        },

    },
    spine: {

    },
    dragonBones: {
        guide: "dragon/sp_shouzhi_",

    },
    material: {
        // uiguide: 'materials/ui-guide'
    },
    audio: {
        addEquip: 'ui/addEquip',
        addHero: "ui/addHero",
        battle: "battle/",
        btnClick: "ui/btnClick",
        invalidClick: "ui/invalidClick",
        main: "ui/main_bgm",
        reward: "ui/reward",
        sign: "ui/sign",
        qhSuc: "ui/qianghuaSuc",
        qh: "ui/qianghua",
        lvUp: "ui/lvUp",
        tupo: "ui/tupo",
        wear: "ui/wear",
        suc: "ui/suc",
        lost: "ui/lost",
        nextWave: "ui/nextWave",
        goBattle: "ui/goBattle",
        haojiao: "ui/haojiao",
        coin: "ui/coin"

    },
    // 路径索引统一中心位置修复配置
    positionOffset: {

    }
}
GAssetImpl.loader.textureRes = Res.texture;