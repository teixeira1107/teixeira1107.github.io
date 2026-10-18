export const phrases = [
['洗漱','该刷牙了，刷完牙我们去看动画片',"Time to brush your teeth! We can watch cartoons when you're done.",["Time to brush your teeth!","We can watch cartoons","when you're done."],['brush /brʌʃ/：结尾 sh 像轻轻“嘘”，不要加一个元音。','teeth /tiːθ/：舌尖轻放上下牙之间，送气；长 ee 拉开一点。','重读 BRUSH、TEETH、CARTOONS；when you’re done 放轻一点。']],
['洗漱','我们去洗手吧',"Let's wash our hands.",["Let's wash","our hands."],['wash /wɑːʃ/：嘴唇先收圆，结尾 sh 轻轻送气。','重读 WASH 和 HANDS，our 轻读。']],
['洗漱','该洗澡了',"It's bath time!",["It's bath time!"],['bath /bæθ/：嘴巴张开，结尾 th 舌尖轻触牙齿、送气。']],
['洗漱','把毛巾拿过来',"Bring your towel, please.",["Bring your towel, please."],['towel /ˈtaʊəl/：前面的 TOW 重读，后面轻轻带过。']],
['吃饭','吃饭了，来坐好',"Dinner's ready! Come sit down.",["Dinner's ready!","Come sit down."],['ready /ˈrɛdi/：重音在 RE，上扬一点更亲切。','sit /sɪt/ 的元音短，不要读成 seat。']],
['吃饭','你还想再来一点吗',"Would you like some more?",["Would you like","some more?"],['would /wʊd/：l 不发音。','重读 LIKE 和 MORE，结尾稍微上扬。']],
['吃饭','先喝点水吧',"Let's have some water first.",["Let's have some water","first."],['美式 water /ˈwɔtər/ 中的 t 常听起来像轻快的 d。','重读 WATER 和 FIRST。']],
['吃饭','小口吃，慢慢嚼',"Take small bites. Chew slowly.",["Take small bites.","Chew slowly."],['chew /tʃuː/：开头像轻轻打喷嚏的 ch，嘴唇收圆。']],
['出门','穿上鞋子，我们出门吧',"Put on your shoes. Let's go!",["Put on your shoes.","Let's go!"],['shoes /ʃuːz/：结尾 z 要有轻微振动。','put on 可以连起来说，重读 SHOES。']],
['出门','出门要牵好我的手',"Hold my hand when we go outside.",["Hold my hand","when we go outside."],['hold /hoʊld/：从张口滑向收圆，不要把结尾 d 加长。','outside 的 SIDE 重读。']],
['出门','把外套穿上，外面冷',"Put on your jacket. It's cold outside.",["Put on your jacket.","It's cold outside."],['jacket /ˈdʒækɪt/：重音在第一音节，结尾 it 轻读。']],
['出门','我们去公园玩吧',"Let's go to the park!",["Let's go","to the park!"],['park /pɑrk/：美式 r 舌头向后收，不要加额外音节。']],
['玩耍','玩完玩具要收好',"Let's put the toys away when we're done.",["Let's put the toys away","when we're done."],['toys /tɔɪz/：oy 从圆口滑向扁口，结尾 z 有声。','away 的 WAY 重读。']],
['玩耍','该轮到你了',"It's your turn!",["It's your turn!"],['turn /tɝn/：舌头向后收，重读 TURN。']],
['玩耍','我们轮流玩吧',"Let's take turns.",["Let's take turns."],['turns 结尾的 n 和 z 连在一起，不加额外元音。']],
['玩耍','你做得真棒，我看见你很努力',"You did it! You worked really hard.",["You did it!","You worked really hard."],['worked /wɝkt/：结尾是轻短的 kt。','把 HARD 读清楚，语气温暖。']],
['睡前','该睡觉了，我们先读一本书',"It's bedtime. Let's read a book first.",["It's bedtime.","Let's read a book first."],['read /riːd/：这里是“读”，ee 拉长。','book /bʊk/：元音短，不要读成拉长的 oo。']],
['睡前','晚安，做个好梦',"Good night. Sweet dreams!",["Good night.","Sweet dreams!"],['dreams /driːmz/：结尾 mz 连起来，语调温柔下降。']],
['睡前','把灯关上吧',"Let's turn off the light.",["Let's turn off","the light."],['light /laɪt/：元音有滑动，结尾 t 轻轻收住。']],
['睡前','你想听哪个故事',"Which story would you like?",["Which story","would you like?"],['story /ˈstɔri/：重音在 STOR。','which 开头是轻短的 w，不要加额外音节。']]
].map(([scene, chinese, english, chunks, tips])=>({scene,chinese,english,chunks,tips,source:'library'}));
export function matchPhrase(text){const clean=s=>s.replace(/[\s，。！？、,.!?；;：:“”"'‘’]/g,'');return phrases.find(p=>clean(p.chinese)===clean(text));}
