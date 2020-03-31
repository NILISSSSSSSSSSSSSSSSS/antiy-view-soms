import { configPermission, bugPermission, patchPermission, assetsPermission, systemPermission, logAlarmPermission, routinePermission, safetyPermission, reportPermission, spPermission, defendPermission } from '@a/permission'
let icon = [
  'M968.145455 491.101091l-433.477819-389.538909a34.350545 34.350545 0 0 0-45.242181 0l-433.477819 389.585454c-20.014545 17.966545-6.050909 48.965818 22.853819 48.965819h60.183272v341.783272C138.984727 906.333091 166.167273 930.909091 186.181818 930.909091h140.567273c30.254545 0 45.940364-22.202182 45.940364-49.012364v-90.065454c0-19.735273 9.774545-47.476364 46.545454-47.476364h186.833455c19.083636 0 45.754182 14.429091 45.754181 47.476364v90.065454c0 27.229091 16.570182 49.012364 46.405819 49.012364h139.310545c16.942545 0 46.545455-15.918545 46.545455-49.012364v-341.783272h61.160727c28.439273 0 42.868364-30.999273 22.807273-49.012364z',
  'M768.232727 853.085091c-5.725091 18.664727-22.946909 31.138909-45.893818 31.138909H205.870545c-10.426182 1.815273-24.762182-13.079273-17.221818-31.138909l136.285091-449.629091c5.771636-18.618182 22.993455-31.092364 45.940364-31.092364H917.410909c17.221818 0 13.963636 24.669091 11.496727 31.092364l-160.674909 449.629091z m89.925818-525.777455H325.073455a49.803636 49.803636 0 0 0-47.290182 37.236364c-65.163636 208.942545-112.500364 376.087273-151.272728 473.274182C104.261818 831.534545 93.090909 815.243636 93.090909 788.945455V188.648727C93.090909 164.538182 119.342545 139.636364 143.127273 139.636364h248.552727c23.738182 0 49.570909 24.901818 49.570909 49.012363v26.763637h416.907636c12.288 0 26.205091 9.309091 26.205091 29.835636v57.809455c0 18.245818-16.942545 24.203636-26.205091 24.203636z',
  'M465.454545 901.12v-326.376727c0-28.066909-20.154182-56.133818-44.823272-69.957818L137.914182 364.730182c-25.134545-9.216-44.823273 0-44.823273 23.458909v331.915636c0 28.066909 20.154182 56.133818 44.823273 69.957818l282.717091 134.516364c25.134545 13.824 44.823273 4.608 44.823272-23.458909zM158.533818 252.741818c-25.181091 13.777455-25.181091 32.628364 0 46.452364l310.690909 154.065454c42.542545 16.942545 51.2 16.942545 85.038546 0l311.202909-154.065454c25.181091-13.824 25.181091-32.674909 0-46.498909l-311.202909-149.224728c-29.323636-13.824-60.276364-13.824-85.038546 0L158.533818 252.695273z m445.160727 671.837091l282.065455-135.307636c25.274182-13.824 45.149091-41.890909 45.149091-69.957818v-326.749091c0-28.113455-20.340364-37.329455-45.149091-23.505455l-282.065455 135.307636c-25.274182 13.824-45.149091 41.890909-45.14909 69.957819v326.749091c0 28.113455 20.340364 37.329455 45.14909 23.505454z',
  'M838.004364 600.064v-97.140364C919.133091 493.754182 977.454545 422.4 977.454545 337.454545a30.021818 30.021818 0 0 0-29.509818-30.394181 30.021818 30.021818 0 0 0-29.509818 30.394181c0 53.108364-30.254545 95.650909-80.430545 104.727273v-21.224727c0-54.644364-64.093091-110.126545-126.138182-135.912727C710.516364 169.658182 625.570909 93.090909 512 93.090909 401.268364 93.090909 319.441455 181.108364 313.530182 291.933091c-76.660364 24.250182-127.069091 66.792727-127.069091 129.024v18.152727c-45.428364-12.381091-81.221818-54.784-80.942546-103.144727a30.021818 30.021818 0 0 0-29.509818-30.394182 30.021818 30.021818 0 0 0-29.463272 30.394182c0 81.92 63.208727 151.738182 139.962181 163.886545v98.676364c0 18.152727 1.489455 36.398545 4.421819 53.108364-75.543273 16.151273-133.957818 84.573091-134.05091 163.933091 0 16.756364 13.265455 30.347636 29.463273 30.347636 16.290909 0 29.509818-13.591273 29.556364-30.347636 0-51.572364 41.099636-95.604364 89.832727-104.727273C252.322909 843.031273 375.342545 930.909091 512 930.909091c137.216 0.325818 261.12-88.529455 306.827636-221.556364 53.620364 4.608 88.157091 50.874182 87.831273 106.216728 0 16.756364 13.218909 30.347636 29.463273 30.347636a30.068364 30.068364 0 0 0 29.509818-30.347636c0-83.456-53.853091-151.738182-132.049455-163.933091 2.885818-16.709818 4.421818-34.909091 4.421819-51.572364zM512.325818 138.705455c73.821091 0 149.271273 61.067636 155.461818 137.774545-43.473455-19.549091-95.278545-29.323636-155.461818-29.323636-59.298909 0-111.104 9.774545-155.461818 29.323636 24.157091-79.825455 81.640727-137.774545 155.461818-137.774545z',
  'M885.76 884.363636c17.687273 0 45.149091-12.148364 45.149091-46.824727V280.762182C930.909091 244.549818 905.495273 232.727273 885.76 232.727273h-139.636364v68.794182c0 24.576-33.419636 57.390545-71.726545 57.390545s-69.12-33.838545-69.12-57.390545V232.727273H419.374545v68.794182c0 24.808727-30.347636 59.531636-70.656 59.531636s-69.818182-34.722909-69.818181-59.531636V232.727273H141.637818C93.090909 232.727273 93.090909 280.762182 93.090909 280.762182v556.776727c0 15.965091 16.663273 46.405818 48.593455 46.405818L885.806545 884.363636zM263.726545 651.636364h403.549091c16.896 0 30.952727 9.588364 30.952728 23.272727 0 13.684364-14.056727 23.272727-30.952728 23.272727h-403.549091C246.225455 698.181818 232.727273 688.593455 232.727273 674.909091c0-14.103273 12.939636-23.272727 30.952727-23.272727z m-2.513454-139.636364h268.939636c15.499636 0 28.439273 9.588364 28.439273 23.272727 0 13.684364-12.939636 23.272727-28.439273 23.272728H261.12C245.154909 558.545455 232.727273 548.957091 232.727273 535.272727c0-14.103273 11.915636-23.272727 28.439272-23.272727z m135.493818-317.998545v93.090909a46.545455 46.545455 0 1 1-93.090909 0v-93.090909a46.545455 46.545455 0 1 1 93.090909 0z m326.097455 0.930909v93.090909a46.545455 46.545455 0 0 1-93.090909 0v-93.090909a46.545455 46.545455 0 1 1 93.090909 0z',
  'M881.384727 139.636364H143.639273C113.245091 139.636364 93.090909 160.023273 93.090909 189.160727v505.902546c0 32.628364 19.735273 49.896727 50.501818 49.896727h344.343273v94.487273H254.696727c-14.149818 0-21.829818 8.145455-21.829818 22.295272s7.68 22.621091 21.829818 22.621091h514.606546c14.149818 0 21.829818-8.471273 21.829818-22.621091s-7.68-22.295273-21.829818-22.295272h-231.936v-94.487273h344.017454c32.721455 0 49.524364-17.501091 49.524364-49.896727V189.114182C930.909091 156.765091 913.826909 139.636364 881.384727 139.636364zM93.090909 604.904727h837.818182v46.545455H93.090909v-46.545455z',
  'M504.738909 94.347636L150.946909 225.419636A17.035636 17.035636 0 0 0 139.636364 241.338182v264.238545c0 188.834909 133.026909 344.203636 327.586909 413.696 44.311273 15.499636 45.242182 15.499636 89.553454 0C751.802182 850.199273 884.363636 694.458182 884.363636 505.576727V240.919273c0-7.121455-4.514909-13.032727-11.310545-15.918546l-354.676364-130.653091a18.944 18.944 0 0 0-13.637818 0z m-177.245091 460.893091c-1.070545-1.070545-11.403636-23.505455 6.144-40.820363 17.501091-17.361455 40.215273-7.168 41.425455-6.050909l83.223272 82.245818a5.306182 5.306182 0 0 0 7.68 0l219.415273-216.576c1.163636-1.117091 25.879273-11.636364 42.682182 6.423272 16.756364 17.966545 5.957818 39.330909 4.840727 40.401455l-264.657454 260.794182c-3.211636 3.537455-8.610909 3.537455-12.241455 0.465454l-128.465454-126.882909z',
  'M139.636364 837.818182h744.727272a46.545455 46.545455 0 1 1 0 93.090909H139.636364a46.545455 46.545455 0 1 1 0-93.090909zM791.272727 93.090909a46.545455 46.545455 0 0 1 46.545455 46.545455v605.090909a46.545455 46.545455 0 1 1-93.090909 0V139.636364a46.545455 46.545455 0 0 1 46.545454-46.545455z m-186.181818 372.363636a46.545455 46.545455 0 0 1 46.545455 46.545455v232.727273a46.545455 46.545455 0 1 1-93.090909 0v-232.727273a46.545455 46.545455 0 0 1 46.545454-46.545455zM418.909091 279.272727a46.545455 46.545455 0 0 1 46.545454 46.545455v418.909091a46.545455 46.545455 0 1 1-93.090909 0V325.818182a46.545455 46.545455 0 0 1 46.545455-46.545455z m-186.181818 279.272728a46.545455 46.545455 0 0 1 46.545454 46.545454v139.636364a46.545455 46.545455 0 1 1-93.090909 0v-139.636364a46.545455 46.545455 0 0 1 46.545455-46.545454z',
  'M954.461091 453.632l-87.319273-31.092364a50.082909 50.082909 0 0 1-26.810182-27.089454l-13.824-33.419637a49.896727 49.896727 0 0 1-0.046545-38.167272l39.703273-83.409455a34.583273 34.583273 0 0 0-5.12-34.862545l-42.635637-42.635637a34.397091 34.397091 0 0 0-34.909091-5.026909l-83.316363 39.656728a50.501818 50.501818 0 0 1-38.260364-0.046546l-33.373091-13.824a50.222545 50.222545 0 0 1-27.089454-26.903273l-31.045819-87.319272a36.072727 36.072727 0 0 0-28.25309-21.783273S529.408 46.545455 512 46.545455c-17.268364 0-30.114909 1.163636-30.114909 1.163636a35.933091 35.933091 0 0 0-28.206546 21.783273L422.539636 156.858182c-5.12 12.148364-14.894545 21.783273-27.089454 26.810182l-33.326546 13.824a50.501818 50.501818 0 0 1-38.213818 0.093091l-83.502545-39.656728a34.676364 34.676364 0 0 0-34.909091 5.026909l-42.589091 42.635637a34.304 34.304 0 0 0-4.980364 34.816l39.610182 83.456c4.980364 10.472727 4.980364 27.648-0.093091 38.167272l-13.824 33.466182a49.943273 49.943273 0 0 1-26.810182 27.089455l-87.319272 31.092363a36.072727 36.072727 0 0 0-21.783273 28.206546S46.545455 494.638545 46.545455 511.953455c0 17.361455 1.163636 30.254545 1.163636 30.254545 1.768727 12.567273 10.053818 23.272727 21.783273 28.206545l87.365818 31.045819c10.938182 3.863273 23.04 16.058182 26.856727 27.089454l13.777455 33.419637c5.12 12.194909 5.12 25.925818 0.139636 38.167272l-39.703273 83.362909a34.490182 34.490182 0 0 0 5.073455 34.909091l42.635636 42.635637c9.774545 7.912727 23.179636 9.914182 34.816 5.12l83.456-39.703273a50.269091 50.269091 0 0 1 38.167273 0l33.419636 13.824c12.241455 5.026909 22.016 14.708364 27.136 26.903273l31.092364 87.365818a35.933091 35.933091 0 0 0 28.113454 21.736727c20.061091 1.536 40.261818 1.536 60.32291 0a36.119273 36.119273 0 0 0 28.25309-21.876364l31.092364-87.365818c5.12-12.148364 14.894545-21.783273 27.089455-26.763636l33.373091-13.824c10.519273-5.12 27.648-5.12 38.213818-0.093091l83.409454 39.656727c11.636364 4.887273 25.041455 2.978909 34.909091-4.980363l42.589091-42.775273a34.443636 34.443636 0 0 0 5.12-34.769455l-39.703273-83.502545a49.710545 49.710545 0 0 1 0-38.120727l13.870546-33.419637c5.026909-12.241455 14.661818-21.969455 26.810182-27.136l87.365818-30.999272a35.979636 35.979636 0 0 0 21.783273-28.206546s1.117091-12.8 1.11709-30.161454a420.817455 420.817455 0 0 0-1.210181-30.11491 35.979636 35.979636 0 0 0-21.783273-28.206545zM325.818182 511.953455A186.181818 186.181818 0 1 1 698.181818 512 186.181818 186.181818 0 0 1 325.818182 512z',
  'M118.644364 935.517091A24.994909 24.994909 0 0 1 93.090909 911.173818V808.029091c0.325818-70.469818 60.462545-127.441455 134.516364-127.441455h172.357818v-105.006545c-118.737455-59.438545-164.445091-199.214545-102.027636-312.226909 62.464-113.012364 209.361455-156.485818 328.145454-97.093818 118.737455 59.438545 164.445091 199.214545 101.981091 312.226909a237.381818 237.381818 0 0 1-101.981091 97.093818v107.845818h170.309818c74.053818 0 134.190545 57.018182 134.516364 127.534546v103.191272a24.064 24.064 0 0 1-9.402182 16.337455 26.530909 26.530909 0 0 1-18.804364 5.213091l-0.930909-0.093091-783.127272-0.046546zM209.454545 791.272727a23.272727 23.272727 0 0 0 0 46.545455h605.09091a23.272727 23.272727 0 0 0 0-46.545455h-605.09091z',
  'M304.546909 466.850909C213.457455 466.850909 139.636364 396.101818 139.636364 305.338182c0-90.763636 73.867636-164.305455 164.957091-164.305455C395.682909 141.032727 465.454545 214.574545 465.454545 305.338182v137.169454a25.041455 25.041455 0 0 1-24.389818 24.296728H304.546909z m414.859636 0h-136.424727A25.041455 25.041455 0 0 1 558.545455 442.461091V305.338182c0-90.763636 69.771636-164.305455 160.86109-164.305455A164.631273 164.631273 0 0 1 884.363636 305.338182c0 90.763636-73.867636 161.512727-164.957091 161.512727zM304.546909 558.545455h136.471273a25.041455 25.041455 0 0 1 24.389818 24.343272v137.122909C465.454545 810.821818 395.682909 884.363636 304.546909 884.363636A164.631273 164.631273 0 0 1 139.636364 720.058182C139.636364 629.294545 213.457455 558.545455 304.546909 558.545455z m414.859636 0C810.496 558.545455 884.363636 629.294545 884.363636 720.058182c0 90.763636-73.867636 164.305455-164.957091 164.305454S558.545455 810.821818 558.545455 720.058182v-137.169455a25.041455 25.041455 0 0 1 24.436363-24.343272h136.424727z m-3.258181 281.134545c68.189091-4.840727 120.832-62.836364 120.832-126.976 0-64.093091-52.642909-100.910545-120.785455-105.751273h-111.941818v106.821818c0.837818 67.118545 40.354909 125.905455 111.941818 125.905455z'
]
export default [
  {
    name: '首页',
    path: '/indexPage',
    tag: 'shouye',
    icon: icon[0],
    selectedIcon: require('@/assets/menuIcon/nav_icon_1_s.svg')
  },
  {
    name: '工作台',
    path: '/workbench',
    show: false
  },
  {
    name: '我的待办',
    path: '/backlog',
    tag: 'shouye',
    show: false
  },
  {
    name: '资产管理',
    tag: assetsPermission.ASSET,
    path: '/asset',
    icon: icon[1],
    selectedIcon: require('@/assets/menuIcon/nav_icon_2_s.svg'),
    children: [
      {
        name: '概览',
        path: '/asset/overview',
        tag: assetsPermission.ASSET_GL
      },
      {
        name: '装机模板管理',
        path: '/asset/installtemplate',
        tag: assetsPermission.ASSET_ZJMB,
        children: [
          {
            name: '装机模板创建',
            show: false,
            path: '/asset/installtemplate/create',
            tag: assetsPermission.ASSET_ZJMB_ADD
          },
          {
            name: '装机模板编辑',
            show: false,
            path: '/asset/installtemplate/edit',
            tag: assetsPermission.ASSET_ZJMB_EDIT
          },
          {
            name: '装机模板详情',
            show: false,
            path: '/asset/installtemplate/detail',
            tag: assetsPermission.ASSET_ZJMB_VIEW
          }
        ]
      },
      {
        name: '资产信息管理',
        path: '/asset/manage',
        tag: assetsPermission.ASSET_INFO,
        children: [
          {
            name: '资产情况',
            show: false,
            path: '/asset/manage/detail'
          },
          {
            name: '资产登记',
            show: false,
            path: '/asset/manage/register'
          },
          {
            name: '资产变更',
            show: false,
            path: '/asset/manage/change'
          }
        ]
      },
      {
        name: 'OA订单管理',
        tag: assetsPermission.ASSET_SF,
        path: '/asset/oa',
        children: [
          {
            name: '订单处理',
            show: false,
            path: '/asset/oa/handle',
            tag: 'asset:group:ckxq'
          }
        ]
      },
      {
        name: '业务管理',
        path: '/asset/business',
        tag: assetsPermission.ASSET_ZCZ,
        children: [
          {
            name: '业务详情',
            show: false,
            path: '/asset/business/details',
            tag: 'asset:group:ckxq'
          },
          {
            name: '登记业务',
            show: false,
            path: '/asset/business/register',
            tag: 'asset:group:dj'
          },
          {
            name: '业务变更',
            show: false,
            path: '/asset/business/update',
            tag: 'asset:group:bg'
          }
        ]
      },
      {
        name: 'key管理',
        tag: assetsPermission.ASSET_SF,
        path: '/asset/key'
      },
      {
        name: '资产借用管理',
        tag: assetsPermission.ASSET_SF,
        path: '/asset/borrow',
        children: [
          {
            name: '出借详情',
            show: false,
            path: '/asset/borrow/details',
            tag: 'asset:group:ckxq'
          },
          {
            name: '历史情况',
            show: false,
            path: '/asset/borrow/history',
            tag: 'asset:group:ckxq'
          }
        ]
      },
      {
        name: '资产组管理',
        path: '/asset/group',
        tag: assetsPermission.ASSET_ZCZ,
        children: [
          {
            name: '资产组详情',
            show: false,
            path: '/asset/group/details',
            tag: 'asset:group:ckxq'
          },
          {
            name: '资产组登记',
            show: false,
            path: '/asset/group/register',
            tag: 'asset:group:dj'
          },
          {
            name: '资产组变更',
            show: false,
            path: '/asset/group/update',
            tag: 'asset:group:bg'
          }
        ]
      },
      {
        name: '身份管理',
        tag: assetsPermission.ASSET_SF,
        path: '/asset/personnel',
        children: [
          {
            name: '组织结构管理',
            path: '/asset/personnel/organization',
            tag: assetsPermission.ASSET_ZZJG
          },
          {
            name: '人员身份管理',
            path: '/asset/personnel/identitymanager',
            tag: assetsPermission.ASSET_RGSF
          }
        ]
      },
      {
        name: '拓扑管理',
        tag: assetsPermission.ASSET_TP,
        path: '/asset/topo',
        children: [
          {
            name: '物理拓扑',
            path: '/asset/topo/physical',
            tag: assetsPermission.ASSET_WL
          }
        ]
      },
      {
        name: '通联管理',
        path: '/asset/relation',
        tag: assetsPermission.ASSET_TL,
        children: [
          {
            name: '通联关联',
            path: '/asset/relation/setting',
            show: false,
            tag: 'asset:tl:tlsz'
          },
          {
            name: '通联关联',
            path: '/asset/relation/details',
            show: false,
            tag: 'asset:tl:tlsz'
          }
        ]
      },
      {
        name: '准入管理',
        path: '/asset/admittance',
        tag: assetsPermission.ASSET_ZT,
        children: [
          {
            name: '历史准入记录',
            show: false,
            path: '/asset/admittance/hisAccessRecord',
            tag: assetsPermission.ASSET_ZT
          }]
      }
    ]
  },
  {
    name: '配置管理',
    tag: configPermission.config,
    path: '/basesetting',
    icon: icon[2],
    selectedIcon: require('@/assets/menuIcon/nav_icon_3_s.svg'),
    children: [
      {
        name: '基准项管理',
        path: '/basesetting/storage',
        tag: configPermission.configBaseitem,
        children: [
          {
            name: '基准项详情',
            show: false,
            path: '/basesetting/storage/detail',
            tag: configPermission.baseitemView
          }
        ]
      },
      {
        name: '基准模板管理',
        path: '/basesetting/model',
        tag: configPermission.configBasetemplate,
        children: [
          {
            name: '新建模板',
            show: false,
            path: '/basesetting/model/edit',
            tag: configPermission.newBasetemplate
          },
          {
            name: '编辑模板',
            show: false,
            path: '/basesetting/model/update',
            tag: configPermission.editBasetemplate
          },
          {
            name: '模板详情',
            show: false,
            path: '/basesetting/model/checkdetail',
            tag: configPermission.viewBasetemplate
          },
          {
            name: '扫描报告详情',
            show: false,
            path: '/basesetting/model/scandetail',
            tag: configPermission.viewScanBasetemplate
          }
        ]
      },
      {
        name: '配置基准管理',
        path: '/basesetting/manage',
        tag: configPermission.viewBaseConfig,
        children: [
          {
            name: '配置详情',
            show: false,
            path: '/basesetting/manage/setting',
            tag: configPermission.viewBaseConfig
          }]
      },
      {
        name: '配置核查管理',
        path: '/basesetting/list/enforcement',
        tag: configPermission.viewBaseInspect
      },
      {
        name: '配置加固管理',
        path: '/basesetting/list/validation',
        tag: configPermission.viewBaseFixed
      }
    ]
  },
  {
    name: '漏洞补丁管理',
    tag: bugPermission.vulPatch,
    path: '/bugpatch',
    icon: icon[3],
    selectedIcon: require('@/assets/menuIcon/nav_icon_4_s.svg'),
    children: [
      {
        name: '漏洞管理',
        tag: bugPermission.vulManage,
        path: '/bugpatch/bugmanage',
        children: [
          {
            name: '突发漏洞管理',
            path: '/bugpatch/bugmanage/unexpected',
            tag: bugPermission.burstManage,
            children: [
              {
                name: '漏洞登记',
                show: false,
                path: '/bugpatch/bugmanage/unexpected/register',
                tag: bugPermission.burstCheckin
              },
              {
                name: '漏洞编辑',
                show: false,
                path: '/bugpatch/bugmanage/unexpected/change',
                tag: bugPermission.burstEdit
              },
              {
                name: '突发漏洞处置',
                show: false,
                path: '/bugpatch/bugmanage/unexpected/dispose',
                tag: bugPermission.burstHandle
              },
              {
                name: '漏洞详情',
                show: false,
                path: '/bugpatch/bugmanage/unexpected/detail',
                tag: bugPermission.burstView
              }
            ]
          },
          {
            name: '漏洞信息管理',
            path: '/bugpatch/bugmanage/information',
            tag: bugPermission.vulInfo,
            children: [
              {
                name: '漏洞处置',
                show: false,
                path: '/bugpatch/bugmanage/information/dispose',
                tag: bugPermission.vulHandle
              },
              {
                name: '漏洞详情',
                show: false,
                path: '/bugpatch/bugmanage/information/detail',
                tag: bugPermission.vulView
              }
            ]
          },
          {
            name: '漏洞处置管理',
            path: '/bugpatch/bugmanage/dispose',
            tag: bugPermission.vulHandleManage,
            children: [
              {
                name: '漏洞修复',
                show: false,
                path: '/bugpatch/bugmanage/dispose/disposebybug',
                tag: bugPermission.vulHandleDeal
              },
              {
                name: '漏洞修复',
                show: false,
                path: '/bugpatch/bugmanage/dispose/disposebyassets',
                tag: bugPermission.vulHandleDeal
              },
              {
                name: '漏洞详情',
                show: false,
                path: '/bugpatch/bugmanage/dispose/detail',
                tag: bugPermission.vulHandleView
              }
            ]
          },
          {
            name: '漏洞知识管理',
            path: '/bugpatch/bugmanage/knowledge',
            tag: bugPermission.vulKnow,
            children: [
              {
                name: '漏洞详情',
                show: false,
                path: '/bugpatch/bugmanage/knowledge/detail',
                tag: bugPermission.vulKnowView
              }
            ]
          }
        ]
      },
      {
        name: '补丁管理',
        tag: patchPermission.patchManage,
        path: '/bugpatch/patchmanage',
        children: [
          {
            name: '应急补丁管理',
            tag: patchPermission.patchEmergencyManage,
            path: '/bugpatch/patchmanage/emergency',
            children: [
              {
                name: '补丁登记',
                show: false,
                path: '/bugpatch/patchmanage/emergency/register',
                tag: patchPermission.patchEmergencyManage
              }, {
                name: '补丁详情',
                show: false,
                path: '/bugpatch/patchmanage/emergency/detail',
                tag: patchPermission.patchEmergencyManageDetail
              }, {
                name: '补丁编辑',
                show: false,
                path: '/bugpatch/patchmanage/emergency/edit',
                tag: patchPermission.patchEmergencyManageEdit
              }
            ]
          }, {
            name: '补丁信息管理',
            tag: patchPermission.PatchInfoManage,
            path: '/bugpatch/patchmanage/information',
            children: [
              {
                name: '补丁处置',
                show: false,
                path: '/bugpatch/patchmanage/information/dispose',
                tag: patchPermission.PatchInfoManageDispose
              },
              {
                name: '补丁详情',
                show: false,
                path: '/bugpatch/patchmanage/information/detail',
                tag: patchPermission.PatchInfoManageDetail
              }]
          }, {
            name: '补丁安装管理',
            tag: patchPermission.PatchInstallManage,
            path: '/bugpatch/patchmanage/install',
            children: [
              {
                name: '补丁安装',
                show: false,
                path: '/bugpatch/patchmanage/install/asset',
                tag: patchPermission.PatchInstallManage
              }, {
                name: '补丁安装',
                show: false,
                path: '/bugpatch/patchmanage/install/patch',
                tag: patchPermission.PatchInstallManage
              }, {
                name: '补丁详情',
                show: false,
                path: '/bugpatch/patchmanage/install/detail',
                tag: patchPermission.PatchInstallManageDetail
              }
            ]
          }, {
            name: '补丁知识管理',
            tag: patchPermission.PatchKnowManage,
            path: '/bugpatch/patchmanage/repository',
            children: [
              {
                name: '补丁详情',
                show: false,
                path: '/bugpatch/patchmanage/repository/detail',
                tag: patchPermission.PatchKnowManageDetail
              }]
          }
        ]
      }
    ]
  },
  {
    name: '日志告警管理',
    tag: logAlarmPermission.logAlarm,
    path: '/logalarm',
    icon: icon[4],
    selectedIcon: require('@/assets/menuIcon/nav_icon_5_s.svg'),
    children: [
      {
        name: '告警管理',
        tag: logAlarmPermission.alarmManage,
        path: '/logalarm/alarm',
        children: [
          {
            name: '告警管理',
            path: '/logalarm/alarm/manage',
            tag: logAlarmPermission.alarmMManage,
            children: [
              {
                name: '告警详情',
                show: false,
                path: '/logalarm/alarm/manage/details',
                tag: logAlarmPermission.alarmMManageCurrentView
              }
            ]
          },
          {
            name: '告警规则',
            path: '/logalarm/alarm/regulation',
            tag: logAlarmPermission.alarmManageRule,
            children: [
              {
                name: '资产监控规则详情',
                show: false,
                path: '/logalarm/alarm/regulation/detail',
                tag: logAlarmPermission.alarmMManageCurrentView
              },
              {
                name: '变更资产监控规则',
                show: false,
                path: '/logalarm/alarm/regulation/edit',
                tag: logAlarmPermission.alarmMManageCurrentView
              },
              {
                name: '创建资产监控规则',
                show: false,
                path: '/logalarm/alarm/regulation/create',
                tag: logAlarmPermission.alarmMManageCurrentView
              }
            ]
          }
        ]
      },
      {
        name: '日志管理',
        tag: logAlarmPermission.logManage,
        path: '/logalarm/log',
        children: [
          {
            name: '操作日志',
            path: '/logalarm/log/manage',
            tag: logAlarmPermission.logManageOperate,
            children: [
              {
                name: '日志详情',
                show: false,
                path: '/logalarm/log/manage/details',
                tag: logAlarmPermission.logManageOperateView
              }
            ]
          },
          {
            name: '系统日志',
            path: '/logalarm/log/system',
            tag: logAlarmPermission.logManageSystem
          },
          {
            name: '审计报告',
            path: '/logalarm/log/audit',
            tag: logAlarmPermission.logManageReport,
            children: [
              {
                name: '审计详情',
                show: false,
                path: '/logalarm/log/audit/details',
                tag: logAlarmPermission.logManageReportView
              }
            ]
          }
        ]
      }
    ]
  },
  {
    name: '安全设备管理',
    tag: safetyPermission.SAFETY,
    path: '/safe',
    icon: icon[5],
    selectedIcon: require('@/assets/menuIcon/nav_icon_6_s.svg'),
    children: [
      {
        name: '设备管理',
        path: '/safe/equipment',
        tag: safetyPermission.SAFETY_SB,
        children: [
          {
            name: '安全设备详情',
            show: false,
            path: '/safe/equipment/detail',
            tag: safetyPermission.SAFETY_SB_CK
          },
          {
            name: '纳入管理登记',
            show: false,
            path: '/safe/equipment/register',
            tag: safetyPermission.SAFETY_SB_DC
          },
          {
            name: '信息变更',
            show: false,
            path: '/safe/equipment/change',
            tag: safetyPermission.SAFETY_SB_BG
          },
          {
            name: '设备版本升级',
            show: false,
            path: '/safe/equipment/versionInformationUpgrade',
            tag: safetyPermission.SAFETY_VERSION
          },
          {
            name: '设备特征库升级',
            show: false,
            path: '/safe/equipment/featureInformationUpgrade',
            tag: safetyPermission.SAFETY_TZKGL
          }
        ]
      },
      {
        name: '性能管理',
        path: '/safe/performance',
        tag: safetyPermission.SAFETY_XN,
        children: [
          {
            name: '指标详情',
            show: false,
            path: '/safe/performance/detail',
            tag: safetyPermission.SAFETY_XN_CK
          }
        ]
      },
      {
        name: '版本管理',
        path: '/safe/version',
        tag: safetyPermission.SAFETY_VERSION,
        children: [
          {
            name: '版本安装',
            show: false,
            path: '/safe/version/manageUpgrade',
            tag: safetyPermission.SAFETY_VERSION_AZ
          },
          {
            name: '版本详情',
            show: false,
            path: '/safe/version/detail',
            tag: safetyPermission.SAFETY_VERSION_CK
          }
        ]
      },
      {
        name: '特征库管理',
        path: '/safe/feature',
        tag: safetyPermission.SAFETY_TZKGL,
        children: [
          {
            name: '特征库安装',
            show: false,
            path: '/safe/feature/manageUpgrade',
            tag: safetyPermission.SAFETY_TZKGL_AZ
          },
          {
            name: '特征库详情',
            show: false,
            path: '/safe/feature/detail',
            tag: safetyPermission.SAFETY_TZKGL_CK
          }
        ]
      },
      {
        name: '威胁事件',
        path: '/safe/threat',
        tag: safetyPermission.SAFETY_WXSJ,
        children: [
          {
            name: '威胁详情',
            show: false,
            path: '/safe/threat/ZhiJiaDetail',
            tag: safetyPermission.SAFETY_WXSJ_ZJ_CK
          },
          {
            name: '威胁详情',
            show: false,
            path: '/safe/threat/TanHaiDetail',
            tag: safetyPermission.SAFETY_WXSJ_TH_CK
          }
        ]
      }
    ]
  },
  {
    name: '安全运维门户',
    tag: defendPermission.PORTAL,
    path: '/defend',
    icon: icon[10],
    children: [
      {
        name: '安全设备运维管理',
        path: '/defend/manage/list',
        tag: defendPermission.PORTAL_EQUIPMENT,
        children: [
          {
            name: '安全设备运维',
            show: false,
            path: '/defend/equipment',
            tag: defendPermission.PORTAL_OPERATE
          }
        ]
      },
      {
        name: '审计管理',
        path: '/defend/audit',
        tag: defendPermission.PORTAL_AUDIT,
        children: [
          {
            name: '运维审计',
            show: true,
            path: '/defend/audit/operationList',
            tag: defendPermission.PORTAL_OPERATE_LIST
          },
          {
            name: '运维日志',
            show: true,
            path: '/defend/audit/logList',
            tag: defendPermission.PORTAL_LOG_LIST
          }
        ]
      }
    ]
  },
  {
    name: '日常安全管理',
    tag: routinePermission.routine,
    path: '/routine',
    icon: icon[6],
    selectedIcon: require('@/assets/menuIcon/nav_icon_7_s.svg'),
    children: [
      {
        name: '巡检任务',
        path: '/routine/inspection',
        tag: routinePermission.routineInspection,
        children: [
          {
            name: '巡检详情',
            show: false,
            path: '/routine/inspection/detail',
            tag: routinePermission.routineInspectView
          }
        ]
      },
      {
        name: '工单管理',
        tag: routinePermission.routineWorkorder,
        path: '/routine/workorder/todo'
      },
      {
        name: '知识库管理',
        path: '/routine/knowledge',
        tag: routinePermission.routineKnowledge,
        children: [
          {
            name: '知识库详情',
            show: false,
            path: '/routine/knowledge/detail',
            tag: 'routine:know:ckxq'
          }
        ]
      }
    ]
  },
  // {
  //   name: '审批管理',
  //   tag: spPermission.sp,
  //   path: '/examine',
  //   icon: icon[9],
  //   selectedIcon: require('@/assets/menuIcon/nav_icon_8_s.svg'),
  //   children: [
  //     {
  //       name: '待审批的',
  //       path: '/examine/list/todo',
  //       tag: spPermission.spDsp
  //     },
  //     {
  //       name: '审批详情',
  //       show: false,
  //       path: '/examine/check',
  //       tag: spPermission.spDspView
  //     },
  //     {
  //       name: '发起的',
  //       path: '/examine/list/create',
  //       tag: spPermission.spSend
  //     }]
  // },
  {
    name: '报表管理',
    tag: reportPermission.REPORT,
    path: '/reportForm',
    icon: icon[7],
    selectedIcon: require('@/assets/menuIcon/nav_icon_10.svg'),
    children: [
      {
        name: '综合报表',
        path: '/reportForm/group',
        tag: reportPermission.REPORT_ASSET
      },
      {
        name: '资产报表',
        path: '/reportForm/asset',
        tag: reportPermission.REPORT_ASSET
      },
      {
        name: '漏洞报表',
        path: '/reportForm/vul',
        tag: reportPermission.REPORT_VUL
      },
      {
        name: '补丁报表',
        path: '/reportForm/patch',
        tag: reportPermission.REPORT_PATCH
      },
      {
        name: '告警报表',
        path: '/reportForm/warn',
        tag: reportPermission.REPORT_ALARM
      }
    ]
  },
  {
    name: '系统管理',
    tag: systemPermission.sys,
    path: '/system',
    icon: icon[8],
    selectedIcon: require('@/assets/menuIcon/nav_icon_9_s.svg'),
    children: [
      {
        name: '用户管理',
        path: '/system/usermanage',
        tag: systemPermission.sysUser,
        children: [
          {
            name: '用户详情信息',
            show: false,
            path: '/system/usermanage/informationcheck',
            tag: systemPermission.sysUserView
          },
          {
            name: '用户变更',
            show: false,
            path: '/system/usermanage/informationChange',
            tag: systemPermission.sysUserUpdate
          },
          {
            name: '用户登记',
            show: false,
            path: '/system/usermanage/informationregister',
            tag: systemPermission.sysUserCheckin
          }
        ]
      },
      {
        name: '角色权限管理',
        path: '/system/rolemanage/list',
        tag: systemPermission.sysRolePermission
      },
      {
        name: '区域管理',
        path: '/system/assetmanage',
        tag: systemPermission.sysArea
      },
      {
        name: '消息管理',
        path: '/system/messagemanage',
        tag: systemPermission.sysMsg
      },
      {
        name: '运行监测',
        path: '/system/monitor',
        tag: systemPermission.sysMonitor
      },
      {
        name: '系统设置',
        path: '/system/setsystem',
        tag: systemPermission.sysSet,
        children: [
          {
            name: '自定义流程角色',
            show: true,
            path: '/system/setsystem/roleworkflow',
            tag: systemPermission.sysSetCustomflowrole
          },
          {
            name: '升级设置',
            show: true,
            path: '/system/setsystem/upgrade/set',
            tag: systemPermission.sysUpgradeSet
          },
          {
            name: '升级记录',
            show: true,
            path: '/system/setsystem/upgrade/record',
            tag: systemPermission.sysUpgradeRecord
          },
          {
            name: '端口管理',
            path: '/system/setsystem/port',
            tag: systemPermission.sysSetPort,
            show: true
          },
          {
            name: '网段管理',
            path: '/system/setsystem/network',
            tag: systemPermission.sysSetNetsegment,
            show: true
          },
          {
            name: '策略配置',
            path: '/system/setsystem/parameter',
            tag: systemPermission.sysStrategy,
            show: true
          },
          {
            name: '网络类型管理',
            path: '/system/setsystem/netmanage',
            tag: systemPermission.sysSetNetsegment,
            show: true
          }
        ]
      },
      {
        name: '定时任务',
        path: '/system/timing',
        tag: systemPermission.sysTimer,
        children: [
          {
            name: '定时任务报告',
            path: '/system/timing/detail',
            show: false,
            tag: systemPermission.sysTimerViewreport
          }
        ]
      }
    ]
  }
]
