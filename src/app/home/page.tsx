import {createClient} from "@/utils/supabase/server";
import NavbarProvider from "@/components/providers/NavbarProvider";
import React from "react";

const Home = async () => {
  const supabase = await createClient();
  const {
    data: {user},
  } = await supabase.auth.getUser();
  return (
    <NavbarProvider user={user}>
      <div className=" w-full">
        Lorem ipsum dolor sit amet consectetur, adipisicing elit. Perspiciatis maxime dolore aliquam
        nam neque beatae voluptate. Voluptates alias recusandae, cum cumque sed ipsam deserunt
        nobis, dolorem veritatis totam similique explicabo. Alias nostrum ex magnam suscipit
        consequuntur iste aut assumenda molestiae aliquam officiis, fugiat blanditiis veritatis
        architecto rerum cupiditate beatae dignissimos earum deleniti ut iure, quidem eum inventore
        explicabo. Animi, magnam. Magni aut suscipit impedit temporibus vel corrupti voluptas
        assumenda saepe corporis? Recusandae esse deserunt odit saepe fugiat eaque, repellat illo
        sed earum error cumque alias delectus quis deleniti, laborum facilis. Quaerat et quia
        voluptatem eum. Pariatur, repellat cumque! Dicta, quis harum aliquam mollitia officiis rerum
        vitae est dolores laudantium, reiciendis quaerat ea laborum ipsa deleniti velit repudiandae!
        Corrupti, quo laboriosam? Recusandae perferendis, deserunt eius sint excepturi, pariatur
        consectetur rerum sapiente, similique nam aliquam ipsam nostrum neque qui culpa doloremque
        accusamus eum veniam ut repellendus! Quibusdam perferendis voluptate sint sunt in? Saepe
        minima excepturi totam deleniti consequatur ipsum iusto, ex voluptate? Itaque, minima cum
        aut repellat debitis cumque eius quam labore esse voluptas excepturi nihil aliquid
        reiciendis ipsa ducimus fugiat? Sapiente? Voluptates vel tenetur est voluptatum autem
        officia, ea aperiam beatae vitae porro obcaecati maxime rem minus veniam, eaque corporis
        dolores nisi rerum harum explicabo iste error esse officiis alias! Consequatur! Minus atque
        assumenda illum tempore officia tempora itaque earum fugiat, veritatis recusandae? Eum
        commodi nemo ex dolore saepe a minus at excepturi sint? Velit recusandae provident voluptas,
        eligendi et accusantium! Maxime quae iure repellendus, voluptatum a quidem obcaecati
        corrupti hic pariatur. Corrupti ducimus accusantium velit repellendus fuga facere
        reprehenderit optio nam rem sunt alias, odit suscipit possimus! Quidem, soluta error.
        Provident, facilis, numquam, dignissimos eius fugiat exercitationem cum ut quia dolorem
        autem eaque dolor voluptatem repellendus nostrum repellat? Dolor cumque nihil aliquid,
        nostrum laborum eum hic earum facilis sunt itaque. Laboriosam nisi maxime assumenda! Ipsa,
        explicabo voluptates minus consequuntur odio, est at blanditiis ratione doloremque pariatur,
        praesentium itaque. Illo sunt adipisci distinctio ut quibusdam atque beatae laudantium,
        eligendi error expedita? Nisi, sapiente doloremque culpa, harum quisquam qui necessitatibus
        quidem voluptatem adipisci iste provident soluta possimus earum itaque commodi dolor labore
        iure. Consectetur voluptatibus vero tempora vel nam explicabo ab laboriosam? Consequatur
        nulla rerum repellendus beatae vero maiores obcaecati ratione rem inventore minus nisi,
        eligendi impedit possimus officia? Cupiditate enim obcaecati eaque accusantium illo, quae
        tempore, blanditiis natus veniam eum sapiente. Dolor eius ea sunt? Repudiandae nam illum
        deleniti quibusdam et dolores a iusto distinctio explicabo sint eveniet inventore dolorum
        deserunt quis ipsum commodi, accusantium ab vel delectus aut nihil hic? Corporis facere,
        esse sint quas rem pariatur ipsam repellat quam et officia animi architecto ea asperiores
        molestias consequatur maiores praesentium exercitationem deleniti tempora. Quisquam dolores
        amet consequatur eveniet suscipit? Exercitationem! Nobis totam aliquam dolor eligendi harum
        iste laudantium in unde? Aliquid quibusdam beatae totam non ratione nesciunt maiores
        praesentium reiciendis illo nihil commodi enim expedita tempore nam, velit fugit omnis!
        Possimus vitae natus voluptatum nemo pariatur ut asperiores? Ea, autem sunt numquam aliquam
        ratione recusandae praesentium adipisci veritatis doloremque, dicta quae neque ex voluptate
        distinctio consectetur. Facilis eveniet aspernatur modi. A vel repudiandae unde dolor
        reprehenderit repellat, placeat vitae sunt veniam, animi tempora expedita. Aliquam doloribus
        accusantium itaque temporibus minima veniam, laboriosam blanditiis quia, aut perspiciatis
        enim placeat doloremque omnis. Nesciunt pariatur ab repellendus harum magnam illum rem
        sapiente, quos optio placeat doloremque, doloribus deserunt quia quod voluptas, vitae
        itaque! Nulla velit commodi sapiente consequatur ducimus eveniet, fuga magni eius. Nesciunt,
        aspernatur dolores! Et culpa commodi eveniet doloremque, ab odio ea quis similique.
        Aspernatur repudiandae vero at cum, alias atque sequi sapiente nisi dolorum dolor dolorem,
        veniam, nostrum delectus quae. Omnis accusamus quam totam suscipit delectus incidunt error
        mollitia nesciunt tempora quidem! Doloremque ad accusantium, eligendi sequi vitae eos in
        molestias provident dicta reiciendis quas perferendis ducimus culpa aut rerum. Nulla,
        laborum corporis, distinctio aliquam velit neque pariatur cupiditate ex, doloremque sunt
        sequi sit veniam necessitatibus rem. Quod sint expedita saepe nobis ipsam, facere sequi
        voluptatibus quibusdam officiis iure modi. Dolor vel, et veniam distinctio inventore, ab
        saepe, esse eos animi aspernatur nisi explicabo qui! Repudiandae necessitatibus, nostrum
        quae eaque excepturi fugit beatae omnis laborum similique earum! Consectetur, ex ullam.
        Alias error velit, deleniti voluptatem est numquam optio quod facere itaque, impedit
        laboriosam dignissimos, temporibus recusandae dolor! Ea neque eveniet hic quisquam fuga. Quo
        asperiores ut consequuntur nulla minima magni. Incidunt dolores non modi, dolorem maxime
        debitis, quidem rem totam, quos nostrum neque beatae mollitia assumenda et cum. Laboriosam
        corporis illum accusantium. Delectus dolorem mollitia tempore consequuntur, voluptatem
        minima atque! Quia est cumque rem minima porro voluptatem cum cupiditate harum. Nemo, facere
        perferendis! Nisi, eligendi error. Asperiores, officia explicabo! Est id suscipit iure ab!
        Ad officia amet rerum qui sit. Nobis, assumenda itaque aliquid exercitationem ducimus, ad
        vero, explicabo odit id mollitia at deleniti minima! Deleniti, quam ad beatae fugiat non id
        illo aliquam, sapiente suscipit inventore fugit, laboriosam blanditiis! Ex voluptas
        laboriosam saepe eum rem, distinctio possimus corporis eos at provident magnam cumque sint
        repellat accusamus aliquam beatae ab, quasi odio deserunt. Saepe fugit recusandae culpa,
        maxime magnam nemo? Ab vel voluptatem, aut nesciunt commodi libero praesentium minima illo
        et laudantium neque facilis, placeat tempora asperiores a suscipit, dolore cumque quaerat
        itaque modi. Fugit, necessitatibus minus! Cupiditate, a quae. Harum, dicta dolorem amet
        nihil, fugiat dolore veritatis exercitationem esse corrupti blanditiis asperiores tempore.
        Molestiae odit, nemo, debitis, commodi ab eius provident doloremque ducimus consequatur
        quaerat assumenda. Voluptatum, numquam nihil. Doloremque ratione corporis aliquid voluptatem
        explicabo eos dolor iusto non, quo nemo ex atque totam mollitia modi vitae neque ea adipisci
        nihil. Inventore, cumque molestias. Sequi dicta doloribus perspiciatis labore! Voluptatum
        impedit quo corporis minima nisi rerum dolore laborum. Molestias quibusdam similique
        adipisci excepturi, fugit est totam vitae. Magni, eaque! Voluptatibus placeat minima
        doloremque quia, suscipit possimus at inventore repellendus. Sunt ex nemo modi nulla
        quisquam dolorem quia aspernatur non consequuntur rerum consequatur esse provident dicta
        deserunt earum distinctio vel, et fugit accusantium recusandae. Natus incidunt magni
        accusantium debitis maxime? Inventore vitae quam dicta doloremque officiis, eaque quaerat
        earum voluptas fugit nisi laudantium asperiores, maxime laboriosam at veritatis illo qui
        accusamus rem nobis, corporis rerum voluptates repudiandae! Similique, enim voluptas!
        Delectus, odio. Vero esse dignissimos mollitia, molestias eos veniam, culpa modi sit maiores
        quidem ducimus exercitationem cum assumenda maxime consequatur dicta nam non blanditiis.
        Doloremque, iste. Libero ipsa iure ad? Impedit mollitia, minima earum esse exercitationem
        inventore officia alias vero facere velit, minus dicta sequi in pariatur magni, iusto et
        eveniet praesentium eos. Commodi soluta ut vel id doloribus nobis. Sit ad optio
        exercitationem! Autem explicabo inventore sunt dolor nulla aliquid aspernatur, dicta natus
        repudiandae voluptas magnam amet animi omnis at distinctio repellat a ipsum aliquam porro
        quibusdam. Mollitia, quidem. Assumenda, modi quod accusantium quibusdam nostrum rerum velit
        alias! Ducimus consequuntur voluptatum recusandae cupiditate dicta quo neque fugiat
        incidunt, quasi ut eos dolor labore cumque quia blanditiis eum aut possimus! Esse recusandae
        libero, iusto molestias, non, ad odio repudiandae perspiciatis ratione molestiae fugiat.
        Explicabo, non. Molestias ab, quaerat reiciendis laboriosam eius necessitatibus quibusdam
        corrupti commodi praesentium blanditiis aliquid perferendis esse. Quidem molestiae ut
        magnam, vel, et sint laboriosam fugiat ab aliquam, iusto incidunt rerum similique adipisci
        ratione temporibus reiciendis iste ullam corrupti ex vero tempora voluptates consectetur
        sequi. Eaque, molestiae? Obcaecati a quos exercitationem minus voluptates? Nesciunt, quasi
        ducimus. Sapiente optio modi quasi pariatur, cum alias, iure omnis quo quidem ab aliquam
        nulla recusandae voluptas accusamus itaque perferendis voluptatibus hic? Debitis nisi
        nostrum ipsum enim sunt sed ipsam sapiente repellat? Doloremque excepturi, tempore enim cum
        quaerat, vero aliquid esse accusamus, quo pariatur repellat omnis inventore consectetur hic
        nisi magnam mollitia. Aspernatur quo aut eos facere, deleniti recusandae possimus! Nulla
        officiis doloribus quasi excepturi, tempora iste nam et soluta praesentium perspiciatis
        repellat minus, suscipit adipisci ut eligendi hic reprehenderit nesciunt velit. Aperiam,
        iure. Labore dolorem nulla ipsa quidem, officia assumenda necessitatibus neque dolore
        nesciunt voluptas! Vero alias expedita magni explicabo earum? Alias non deserunt laudantium,
        aperiam nobis blanditiis quas eveniet voluptatibus? Culpa quidem quae debitis? Ex expedita
        iure, temporibus dignissimos optio eveniet. Ea facilis laborum consequuntur ullam deserunt
        consequatur ipsa exercitationem! Officia aliquam temporibus enim. Delectus fugit odit modi
        recusandae laudantium? Vel consectetur eos dignissimos reprehenderit itaque voluptates
        commodi culpa sint assumenda repellat quibusdam recusandae sunt ducimus accusamus reiciendis
        aperiam atque tempore, modi ipsam dolore voluptatibus praesentium, quae optio. Architecto,
        ea. Cumque dignissimos neque harum maxime libero excepturi magnam. Voluptatum, itaque
        corporis optio recusandae rerum quidem labore reprehenderit. Dicta sapiente cum ad dolores
        optio, sint nihil quisquam quibusdam quo, assumenda facilis! Cumque hic, nesciunt ducimus
        aperiam expedita iste vel voluptate odio magni facilis maiores rem omnis, modi deleniti
        placeat eum amet dignissimos dolorem. Aliquam, praesentium alias facilis ullam illo
        consequuntur neque. Magni, quisquam fuga obcaecati, quae perspiciatis dolorem esse deleniti
        architecto labore officiis beatae ullam minima eius veritatis voluptatum molestias? Illo
        quis obcaecati doloremque velit quaerat dolores ipsa vel quae nostrum. Sint sapiente
        architecto amet veritatis inventore quas beatae iure soluta distinctio maiores magnam, odio
        id odit nam, labore consequuntur molestiae asperiores perspiciatis harum incidunt
        praesentium ipsam excepturi! Inventore, minima ex! Animi, explicabo? Adipisci rem doloremque
        necessitatibus voluptatem quam perferendis a ab sed distinctio similique cum fugiat quaerat,
        at quo culpa atque quae optio pariatur eaque sit! Quasi incidunt culpa velit. Recusandae
        quam corporis consequuntur animi, nulla delectus officia? Laudantium nobis earum similique
        iure optio ducimus suscipit? Quibusdam, nam ea itaque cupiditate dolorem ullam eligendi
        numquam distinctio provident laudantium illo! Delectus. Explicabo esse minus voluptas nam
        veritatis excepturi reprehenderit nisi in pariatur placeat, laboriosam beatae ratione saepe
        vitae dicta aut aliquam doloribus commodi tempore culpa eos molestias! In animi corporis
        cum? Necessitatibus assumenda suscipit quo harum eligendi tempora, a doloribus modi ea
        repellendus. Dolorem libero architecto odit dicta quasi amet aut molestias nobis officiis,
        corporis dolore eligendi eos neque omnis voluptate. Laboriosam architecto vel eos alias non
        et distinctio dignissimos reiciendis nam modi, consequuntur deserunt necessitatibus delectus
        aliquid consectetur rerum animi dolore ex magnam cum optio? Quae autem repudiandae culpa
        commodi! Maxime dolore totam at quasi distinctio deleniti ea quibusdam praesentium
        doloribus, fugiat ut? Beatae, hic. Cumque autem distinctio dolore culpa voluptates in,
        repudiandae nam facilis officiis, quidem laudantium atque reiciendis. Modi, nam tempora! Sed
        assumenda ipsa alias iusto cupiditate nobis accusamus cum non, sequi quos quam, deserunt
        explicabo, delectus doloribus blanditiis vitae dicta asperiores quisquam animi expedita.
        Odit, explicabo aut! Nam praesentium accusantium, voluptas ab odit dolore aperiam quam,
        tempora expedita, ex rerum vero. Obcaecati, cum ipsa? Maiores velit esse quia reiciendis
        placeat ea facere! Iure tempore nemo reprehenderit unde? Explicabo modi, iste nisi facilis
        id reiciendis beatae nulla obcaecati quasi autem sunt eaque ad delectus! Ea tempora ullam
        soluta ratione sapiente quod eveniet, non eum, accusantium officiis at quos! Nobis suscipit
        saepe voluptatem natus architecto, quod nam dolore sed recusandae ad atque exercitationem
        possimus ut doloribus nesciunt quisquam reprehenderit, eaque, qui ratione perferendis vel
        doloremque excepturi. Voluptates, non est? Aspernatur iure quia ipsa facilis. Laboriosam
        commodi tempore unde excepturi, esse laborum recusandae maxime molestias illo, ducimus, sunt
        eaque minus ut fuga perferendis consectetur aliquam! Tempore quasi aliquid at ab! Iste quasi
        corrupti totam quidem ut nam, sequi, non ullam qui recusandae necessitatibus amet. Provident
        sunt accusamus inventore eaque enim eveniet ut placeat, beatae sed fugiat saepe expedita
        sint ea. Non dicta maxime velit, adipisci iusto dolor molestias quidem nisi vero ipsa
        consequatur illo, cum cumque tempora odit alias culpa veritatis? Error quos velit nemo
        mollitia sed, eius quo adipisci! Consectetur animi, odio quia harum, consequatur aperiam et
        neque, voluptas laborum illum nobis sit deserunt possimus. Nostrum enim illo officiis at qui
        voluptate autem consequatur error tempore dicta! Commodi, tenetur? Nulla aperiam, reiciendis
        culpa recusandae nihil ex! Quibusdam eaque sit nam doloremque minima vero voluptate libero
        odit maxime, corrupti est sed consectetur rerum eius commodi sunt! Hic vero impedit
        voluptatibus? Porro natus sed temporibus sit dolores optio expedita, deleniti suscipit vitae
        veniam eligendi soluta? Odio, nisi assumenda deserunt eius perspiciatis aperiam, suscipit
        ullam qui, vitae voluptatem cumque blanditiis fuga provident? Nobis nihil asperiores quod
        quia odio molestias fugiat alias, quo facilis accusantium temporibus esse ab consequuntur!
        Ipsum vero recusandae, excepturi, eos harum nihil explicabo saepe laudantium sequi dolore
        possimus nisi! Id est rerum, libero quae laudantium fugiat ea perferendis iste omnis velit
        consequatur esse voluptatum vel culpa itaque expedita cupiditate deleniti at reprehenderit
        mollitia reiciendis, repellat asperiores! Laudantium, doloribus natus! Fuga, excepturi
        error? Quia quidem hic aut soluta fuga ut nostrum, expedita officiis alias porro enim
        dignissimos error non, quis autem libero eaque eos aliquid! Beatae laboriosam molestiae quod
        repellat! Quo et sapiente culpa autem voluptate recusandae omnis maxime! Esse nam omnis
        dignissimos asperiores placeat fugit possimus voluptas perferendis! Aut molestias explicabo
        quisquam ratione repellat quae laboriosam, aspernatur et. Excepturi? Magnam animi quae
        soluta at nam id consequuntur, fugit consequatur dignissimos, ipsa nobis architecto unde
        veritatis. Minima tempore sunt corrupti, corporis quod incidunt, non rem repellat atque
        illum asperiores illo! Recusandae reprehenderit quidem esse impedit nobis doloribus
        explicabo, excepturi odit error repudiandae aliquid nulla ducimus vitae culpa tempora ad ut.
        Id, iste quo. Quibusdam, voluptas enim! Tempora hic consequatur quod? Dicta fugiat velit
        iusto quisquam fugit provident repudiandae expedita, nostrum illum ut exercitationem odio
        soluta quis veritatis dignissimos eius molestiae eos cupiditate officiis. Autem earum
        pariatur totam veniam quae magni. Cum, quasi. In at doloremque culpa iste et harum
        perferendis incidunt dolorem mollitia, earum voluptatem accusantium provident rerum vel odio
        cupiditate non corporis aliquid! Suscipit fuga nobis minus eos corrupti! Facilis minima
        possimus magni illo molestias officia est saepe unde iure fuga ut et, quo libero vitae omnis
        doloremque ad! Culpa, quo eos. Quas excepturi autem porro, inventore dolore vero? Sit,
        eveniet placeat. Dolor non maxime eius minus similique rerum at iusto magnam, ducimus
        mollitia adipisci, nostrum aperiam, quaerat corrupti provident odio exercitationem est a.
        Pariatur fugit aperiam repellendus saepe! Voluptatem porro reiciendis consectetur dicta,
        iure dolor corporis quia nisi at rem eligendi hic dolorum ipsa, magnam est saepe
        perspiciatis laborum distinctio. Dolorum unde reiciendis odio obcaecati natus quod
        voluptate? A rem fuga similique exercitationem quisquam sed amet possimus expedita et
        temporibus veniam dolore architecto rerum repudiandae, vel magnam, mollitia sunt.
        Voluptatibus laboriosam commodi omnis? Repellendus qui itaque ullam perferendis! Quasi
        debitis odit nisi totam odio eligendi aperiam officiis neque consequuntur sint natus
        voluptates omnis corrupti quidem aut est, fugit repellat vel amet in. Fugit repellat rem
        nulla impedit tempore. Totam rem animi numquam, eligendi quas nisi quisquam obcaecati
        aliquid voluptatem cum dolore optio cupiditate quae exercitationem laudantium architecto
        tenetur. Ipsam consectetur vel aliquam quis quam velit explicabo, id dolorum. Eius odit,
        aspernatur maiores cumque nihil sit tempora saepe veritatis est obcaecati! Unde voluptate
        quo optio maiores dolor, tempore possimus eaque repellendus facere repellat expedita.
        Tenetur magni obcaecati fugiat quo. Saepe laudantium consectetur architecto totam
        exercitationem! Accusantium doloremque corporis dolores aliquid asperiores iusto consectetur
        ipsa tempora commodi, placeat maxime nisi, veritatis facilis, exercitationem cumque quisquam
        laudantium quidem id earum! Veniam? Error aut eius excepturi aperiam velit numquam corporis,
        impedit vero dolor fuga exercitationem a. Dignissimos assumenda ea porro, ex consequuntur,
        atque est in quo vitae deserunt reprehenderit, nam voluptas quidem. Iste veniam, iusto
        possimus reiciendis praesentium error officiis molestiae explicabo voluptates modi. Ipsum,
        quas delectus repellat dicta repellendus eos error neque laboriosam, fugiat voluptatum
        facilis accusantium cupiditate ullam, accusamus velit. Voluptatem nostrum commodi fuga
        reprehenderit odio, officiis animi deleniti minima iure qui quod. Ullam, dicta? Quam,
        pariatur blanditiis mollitia esse minima, dicta doloribus voluptate porro distinctio, aut
        sunt iure obcaecati. Iure eos dolore, aliquid quo sequi a alias similique voluptates nemo
        molestiae corrupti aspernatur, minus exercitationem autem dolorem repellendus ut, id et
        quasi. Autem tempora expedita facilis! Amet, consequatur deserunt? Hic, mollitia amet qui
        labore quae atque eaque aliquid voluptatibus quisquam odit dolores nam iste veniam incidunt?
        Nesciunt aperiam nulla voluptatem porro delectus. Itaque odit labore perferendis sunt
        aliquid fuga? Molestiae ut iusto provident saepe ipsum ducimus, libero modi veritatis,
        veniam vitae doloremque nam officiis. Illo, totam ipsam. Odio iusto repellat inventore vero
        velit ipsam commodi quia molestias tempore sequi. Dolor, voluptatibus? Nesciunt earum magnam
        porro in! Voluptas quasi quisquam et quam amet nam suscipit fugit eum sed deserunt dolore
        cupiditate possimus, eius animi explicabo obcaecati consectetur inventore ad minus. Cum iste
        id voluptates provident repellendus impedit iure. Expedita commodi quis ipsa quidem sed.
        Praesentium, eveniet sit. Quibusdam quo magnam nisi quisquam soluta itaque, repellendus
        debitis, pariatur aliquid repellat illo! Possimus beatae suscipit aspernatur nemo quis
        magnam, mollitia earum, error minus laborum, atque minima maiores numquam nulla voluptatum!
        Distinctio natus fugiat fuga veniam maiores eaque alias doloremque in possimus sapiente. Hic
        labore error recusandae neque obcaecati minima animi aut, quas, ipsam possimus sint odit
        unde ad sed nihil dolorem laboriosam, optio molestias blanditiis fugit. Ullam cum aliquid
        ipsum aperiam ipsa. Harum et minima quas dolorem at, laboriosam facilis fuga ab accusantium,
        alias enim architecto cumque ullam eum eaque velit esse eius numquam. Harum magni dolores
        debitis, blanditiis voluptates nemo corporis? Magnam eius dolorum voluptatibus! Expedita
        dicta eligendi nisi, voluptates architecto, iusto tenetur omnis harum possimus blanditiis ut
        temporibus veritatis doloremque ab sint quasi vitae quisquam ducimus ipsa rerum dolorem
        animi. Nam, soluta aliquam nulla doloremque iste eos fugiat porro eum aut doloribus nostrum
        delectus earum atque sapiente in similique consequuntur voluptatibus cupiditate numquam
        eligendi. Quidem esse minus voluptatem totam commodi. Magni officiis, vero eum similique,
        corporis fugiat fugit cupiditate ipsa repudiandae voluptatibus sapiente delectus totam.
        Quisquam nisi accusamus laboriosam praesentium voluptatem rerum, dolore animi nihil, ipsum,
        inventore ad quo illo? Aut numquam nobis mollitia perferendis quas eum deserunt explicabo
        doloremque facere molestias, dolorem doloribus consectetur. Nobis, ipsa mollitia? Expedita
        tenetur soluta inventore dolores officia nostrum earum exercitationem eligendi minus totam?
        Consequatur eaque facere voluptate pariatur officia, vero tempore libero excepturi
        voluptatibus exercitationem magnam omnis, a fugit suscipit distinctio soluta unde corrupti
        dolores nesciunt molestiae voluptatum asperiores. Aliquam quos eos deleniti? Atque eaque,
        quia nam ad voluptate voluptas itaque tempora! Ut, libero cum tempore mollitia cumque
        nostrum quos nisi vitae iste nesciunt officiis velit quibusdam distinctio sapiente, at sit
        hic accusantium. Quisquam repellendus consequatur officia, hic consequuntur in consectetur
        dignissimos id perspiciatis, esse nemo alias natus voluptates ad quo. Sit obcaecati iure
        est, sed minus soluta ea quo repellendus aliquam quibusdam.
      </div>
    </NavbarProvider>
  );
};

export default Home;
