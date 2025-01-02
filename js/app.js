$(document).ready(function () {
    produto.eventos.init();
})

var produto = {};

var MEU_CARRINHO = [];
var MEU_ENDERECO = null;

var VALOR_CARRINHO = 0;
var FRETE_VALORES = {
    "default": "A combinar", // Caso o estado não seja identificado
};

var CELULAR_EMPRESA = '5581983184840';

produto.eventos = {

    init: () => {
        produto.metodos.obterItensProduto();
        produto.metodos.carregarBotaoLigar();
        produto.metodos.carregarBotaoatendimento();
    }

}

produto.metodos = {

    // obtem a lista de itens do cardápio
    obterItensProduto: (categoria = 'maternidade', vermais = false) => {

        var filtro = MENU[categoria];
        console.log(filtro);

        if (!vermais) {
            $("#itensProduto").html('');
            $("#btnVerMais").removeClass('hidden');
        }

        $.each(filtro, (i, e) => {

            let temp = produto.templates.item.replace(/\${img}/g, e.img)
            .replace(/\${nome}/g, e.name)
            .replace(/\${dsc}/g, e.dsc)
            .replace(/\${preco}/g, e.price.toFixed(2).replace('.', ','))
            .replace(/\${id}/g, e.id)

            // botão ver mais foi clicado (12 itens)
            if (vermais && i >= 8 && i < 12) {
                $("#itensProduto").append(temp)
            }

            // paginação inicial (8 itens)
            if (!vermais && i < 8) {
                $("#itensProduto").append(temp)
            }

        })

        // remove o ativo
        $(".container-menu a").removeClass('active');

        // seta o menu para ativo
        $("#menu-" + categoria).addClass('active')

    },

    // clique no botão de ver mais
    verMais: () => {

        var ativo = $(".container-menu a.active").attr('id').split('menu-')[1];
        produto.metodos.obterItensProduto(ativo, true);

        $("#btnVerMais").addClass('hidden');

    },

    // diminuir a quantidade do item no produto
    diminuirQuantidade: (id) => {

        let qntdAtual = parseInt($("#qntd-" + id).text());

        if (qntdAtual > 0) {
            $("#qntd-" + id).text(qntdAtual - 1)
        }

    },

    // aumentar a quantidade do item no produto
    aumentarQuantidade: (id) => {

        let qntdAtual = parseInt($("#qntd-" + id).text());
        $("#qntd-" + id).text(qntdAtual + 1)

    },

    // adicionar ao carrinho o item do cardápio
    adicionarAoCarrinho: (id) => {

        let qntdAtual = parseInt($("#qntd-" + id).text());

        if (qntdAtual > 0) {

            // obter a categoria ativa
            var categoria = $(".container-menu a.active").attr('id').split('menu-')[1];

            // obtem a lista de itens
            let filtro = MENU[categoria];

            // obtem o item
            let item = $.grep(filtro, (e, i) => { return e.id == id });

            if (item.length > 0) {

                // validar se já existe esse item no carrinho
                let existe = $.grep(MEU_CARRINHO, (elem, index) => { return elem.id == id });

                // caso já exista o item no carrinho, só altera a quantidade
                if (existe.length > 0) {
                    let objIndex = MEU_CARRINHO.findIndex((obj => obj.id == id));
                    MEU_CARRINHO[objIndex].qntd = MEU_CARRINHO[objIndex].qntd + qntdAtual;
                }
                // caso ainda não exista o item no carrinho, adiciona ele 
                else {
                    item[0].qntd = qntdAtual;
                    MEU_CARRINHO.push(item[0])
                }      
                
                produto.metodos.mensagem('Item adicionado ao carrinho', 'green')
                $("#qntd-" + id).text(0);

                produto.metodos.atualizarBadgeTotal();

            }

        }

    },

    // atualiza o badge de totais dos botões "Meu carrinho"
    atualizarBadgeTotal: () => {

        var total = 0;

        $.each(MEU_CARRINHO, (i, e) => {
            total += e.qntd
        })

        if (total > 0) {
            $(".botao-carrinho").removeClass('hidden');
            $(".container-total-carrinho").removeClass('hidden');
        }
        else {
            $(".botao-carrinho").addClass('hidden')
            $(".container-total-carrinho").addClass('hidden');
        }

        $(".badge-total-carrinho").html(total);

    },

    // abrir a modal de carrinho
    abrirCarrinho: (abrir) => {

        if (abrir) {
            $("#modalCarrinho").removeClass('hidden');
            produto.metodos.carregarCarrinho();
        }
        else {
            $("#modalCarrinho").addClass('hidden');
        }

    },

    // altera os texto e exibe os botões das etapas
    carregarEtapa: (etapa) => {
        if (etapa == 1) {
            $("#lblTituloEtapa").text('Dados Pessoais:');
            $("#dadosPessoais").removeClass('hidden');
            $("#itensCarrinho").addClass('hidden');
            $("#localEntrega").addClass('hidden');
            $("#resumoCarrinho").addClass('hidden');
    
            $(".etapa").removeClass('active');
            $(".etapa1").addClass('active');
    
            $("#btnEtapaPedido").removeClass('hidden');
            $("#btnEtapaEndereco").addClass('hidden');
            $("#btnEtapaResumo").addClass('hidden');
            $("#btnVoltar").addClass('hidden');
        }
    
        if (etapa == 2) {
            $("#lblTituloEtapa").text('Endereço de entrega:');
            $("#dadosPessoais").addClass('hidden');
            $("#localEntrega").removeClass('hidden');
            $("#resumoCarrinho").addClass('hidden');
    
            $(".etapa").removeClass('active');
            $(".etapa1").addClass('active');
            $(".etapa2").addClass('active');
    
            $("#btnEtapaPedido").addClass('hidden');
            $("#btnEtapaEndereco").removeClass('hidden');
            $("#btnEtapaResumo").addClass('hidden');
            $("#btnVoltar").removeClass('hidden');
        }
    
        if (etapa == 3) {
            $("#lblTituloEtapa").text('Resumo do pedido:');
            $("#dadosPessoais").addClass('hidden');
            $("#localEntrega").addClass('hidden');
            $("#resumoCarrinho").removeClass('hidden');
    
            $(".etapa").removeClass('active');
            $(".etapa1").addClass('active');
            $(".etapa2").addClass('active');
            $(".etapa3").addClass('active');
    
            $("#btnEtapaPedido").addClass('hidden');
            $("#btnEtapaEndereco").addClass('hidden');
            $("#btnEtapaResumo").removeClass('hidden');
            $("#btnVoltar").removeClass('hidden');
        }
    },

    formatarCPF: (input) => {
        let valor = input.value.replace(/\D/g, '');
        valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
        valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
        valor = valor.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        input.value = valor;
    },
    
    formatarTelefone: (input) => {
        let valor = input.value.replace(/\D/g, '');
        valor = valor.replace(/^(\d{2})(\d)/g, '($1) $2');
        valor = valor.replace(/(\d{4,5})(\d{4})$/, '$1-$2');
        input.value = valor;
    },
    
    validarDadosPessoais: () => {
        let nome = $("#txtNomeCompleto").val().trim();
        let cpf = $("#txtCPF").val().trim();
        let telefone = $("#txtTelefone").val().trim();
        let email = $("#txtEmail").val().trim();
    
        if (nome.length === 0) {
            produto.metodos.mensagem('Informe o Nome Completo.');
            $("#txtNomeCompleto").focus();
            return false;
        }
    
        if (cpf.length !== 14) { // CPF formatado tem 14 caracteres
            produto.metodos.mensagem('Informe um CPF válido.');
            $("#txtCPF").focus();
            return false;
        }
    
        if (telefone.length < 14) { // Telefone formatado mínimo: (XX) XXXXX-XXXX
            produto.metodos.mensagem('Informe um Telefone válido.');
            $("#txtTelefone").focus();
            return false;
        }
    
        if (email.length === 0 || !/\S+@\S+\.\S+/.test(email)) {
            produto.metodos.mensagem('Informe um E-mail válido.');
            $("#txtEmail").focus();
            return false;
        }
    
        return true;
    },
    
    carregarEndereco: () => {
        if (!produto.metodos.validarDadosPessoais()) return;
        produto.metodos.carregarEtapa(2);
    },
    
    

    // botão de voltar etapa
    voltarEtapa: () => {

        let etapa = $(".etapa.active").length;
        produto.metodos.carregarEtapa(etapa - 1);

    },

    // carrega a lista de itens do carrinho
    carregarCarrinho: () => {

        produto.metodos.carregarEtapa(1);

        if (MEU_CARRINHO.length > 0) {

            $("#itensCarrinho").html('');

            $.each(MEU_CARRINHO, (i, e) => {

                let temp = produto.templates.itemCarrinho.replace(/\${img}/g, e.img)
                .replace(/\${nome}/g, e.name)
                .replace(/\${preco}/g, e.price.toFixed(2).replace('.', ','))
                .replace(/\${id}/g, e.id)
                .replace(/\${qntd}/g, e.qntd)

                $("#itensCarrinho").append(temp);

                // último item
                if ((i + 1) == MEU_CARRINHO.length) {
                    produto.metodos.carregarValores();
                }

            })

        }
        else {
            $("#itensCarrinho").html('<p class="carrinho-vazio"><i class="fa fa-shopping-bag"></i> Seu carrinho está vazio.</p>');
            produto.metodos.carregarValores();
        }

    },

    // diminuir quantidade do item no carrinho
    diminuirQuantidadeCarrinho: (id) => {

        let qntdAtual = parseInt($("#qntd-carrinho-" + id).text());

        if (qntdAtual > 1) {
            $("#qntd-carrinho-" + id).text(qntdAtual - 1);
            produto.metodos.atualizarCarrinho(id, qntdAtual - 1);
        }
        else {
            produto.metodos.removerItemCarrinho(id)
        }

    },

    // aumentar quantidade do item no carrinho
    aumentarQuantidadeCarrinho: (id) => {

        let qntdAtual = parseInt($("#qntd-carrinho-" + id).text());
        $("#qntd-carrinho-" + id).text(qntdAtual + 1);
        produto.metodos.atualizarCarrinho(id, qntdAtual + 1);

    },

    // botão remover item do carrinho
    removerItemCarrinho: (id) => {

        MEU_CARRINHO = $.grep(MEU_CARRINHO, (e, i) => { return e.id != id });
        produto.metodos.carregarCarrinho();

        // atualiza o botão carrinho com a quantidade atualizada
        produto.metodos.atualizarBadgeTotal();
        
    },

    // atualiza o carrinho com a quantidade atual
    atualizarCarrinho: (id, qntd) => {

        let objIndex = MEU_CARRINHO.findIndex((obj => obj.id == id));
        MEU_CARRINHO[objIndex].qntd = qntd;

        // atualiza o botão carrinho com a quantidade atualizada
        produto.metodos.atualizarBadgeTotal();

        // atualiza os valores (R$) totais do carrinho
        produto.metodos.carregarValores();

    },

    // carrega os valores de SubTotal, Entrega e Total
    carregarValores: () => {
        VALOR_CARRINHO = 0;
    
        $("#lblSubTotal").text('R$ 0,00');
        $("#lblValorEntrega").text('A combinar');
        $("#lblValorTotal").text('R$ 0,00');
    
        $.each(MEU_CARRINHO, (i, e) => {
            VALOR_CARRINHO += parseFloat(e.price * e.qntd);
    
            if ((i + 1) === MEU_CARRINHO.length) {
                let valorFrete = "A combinar";
    
                if ($("#opcaoRetirada").is(":checked")) {
                    valorFrete = 0; // Se retirada está ativada, frete é zero
                } else if (MEU_ENDERECO) {
                    let uf = MEU_ENDERECO.uf;
                    if (FRETE_VALORES[uf]) {
                        valorFrete = FRETE_VALORES[uf];
                    }
                }
    
                VALOR_ENTREGA = isNaN(valorFrete) ? 0 : valorFrete;
                let valorFreteTexto = isNaN(valorFrete) ? valorFrete : `R$ ${valorFrete.toFixed(2).replace('.', ',')}`;
    
                $("#lblSubTotal").text(`R$ ${VALOR_CARRINHO.toFixed(2).replace('.', ',')}`);
                $("#lblValorEntrega").text(`+ ${valorFreteTexto}`);
                $("#lblValorTotal").text(`R$ ${(VALOR_CARRINHO + VALOR_ENTREGA).toFixed(2).replace('.', ',')}`);
            }
        });
    },
    

    // carregar a etapa enderecos
    carregarEndereco: () => {

        if (MEU_CARRINHO.length <= 0) {
            produto.metodos.mensagem('Seu carrinho está vazio.')
            return;
        } 

        produto.metodos.carregarEtapa(2);

    },

    // API ViaCEP
    buscarCep: () => {

        // cria a variavel com o valor do cep
        var cep = $("#txtCEP").val().trim().replace(/\D/g, '');

        // verifica se o CEP possui valor informado
        if (cep != "") {

            // Expressão regular para validar o CEP
            var validacep = /^[0-9]{8}$/;

            if (validacep.test(cep)) {

                $.getJSON("https://viacep.com.br/ws/" + cep + "/json/?callback=?", function (dados) {

                    if (!("erro" in dados)) {

                        // Atualizar os campos com os valores retornados
                        $("#txtEndereco").val(dados.logradouro);
                        $("#txtBairro").val(dados.bairro);
                        $("#txtCidade").val(dados.localidade);
                        $("#ddlUf").val(dados.uf);
                        $("#txtNumero").focus();

                    }
                    else {
                        produto.metodos.mensagem('CEP não encontrado. Preencha as informações manualmente.');
                        $("#txtEndereco").focus();
                    }

                })

            }
            else {
                produto.metodos.mensagem('Formato do CEP inválido.');
                $("#txtCEP").focus();
            }

        }
        else {
            produto.metodos.mensagem('Informe o CEP, por favor.');
            $("#txtCEP").focus();
        }

    },

    // validação antes de prosseguir para a etapa 3
    resumoPedido: () => {
        // Coletar Dados Pessoais
        let nome = $("#txtNomeCompleto").val().trim();
        let cpf = $("#txtCPF").val().trim();
        let telefone = $("#txtTelefone").val().trim();
        let email = $("#txtEmail").val().trim();
    
        // Validar Dados Pessoais
        if (nome.length <= 0) {
            produto.metodos.mensagem('Informe o Nome Completo, por favor.');
            $("#txtNomeCompleto").focus();
            return;
        }
    
        if (cpf.length !== 14) {
            produto.metodos.mensagem('Informe um CPF válido.');
            $("#txtCPF").focus();
            return;
        }
    
        if (telefone.length < 14) {
            produto.metodos.mensagem('Informe um Telefone válido.');
            $("#txtTelefone").focus();
            return;
        }
    
        if (email.length <= 0 || !/\S+@\S+\.\S+/.test(email)) {
            produto.metodos.mensagem('Informe um E-mail válido.');
            $("#txtEmail").focus();
            return;
        }
    
        MEUS_DADOS_PESSOAIS = {
            nome: nome,
            cpf: cpf,
            telefone: telefone,
            email: email
        };
    
        // Coletar Dados do Endereço
        let cep = $("#txtCEP").val().trim();
        let endereco = $("#txtEndereco").val().trim();
        let bairro = $("#txtBairro").val().trim();
        let cidade = $("#txtCidade").val().trim();
        let uf = $("#ddlUf").val().trim();
        let numero = $("#txtNumero").val().trim();
        let complemento = $("#txtComplemento").val().trim();
    
        // Validar Dados do Endereço
        if (cep.length <= 0) {
            produto.metodos.mensagem('Informe o CEP, por favor.');
            $("#txtCEP").focus();
            return;
        }
    
        if (endereco.length <= 0) {
            produto.metodos.mensagem('Informe o Endereço, por favor.');
            $("#txtEndereco").focus();
            return;
        }
    
        if (bairro.length <= 0) {
            produto.metodos.mensagem('Informe o Bairro, por favor.');
            $("#txtBairro").focus();
            return;
        }
    
        if (cidade.length <= 0) {
            produto.metodos.mensagem('Informe a Cidade, por favor.');
            $("#txtCidade").focus();
            return;
        }
    
        if (uf == "-1") {
            produto.metodos.mensagem('Informe a UF, por favor.');
            $("#ddlUf").focus();
            return;
        }
    
        if (numero.length <= 0) {
            produto.metodos.mensagem('Informe o Número, por favor.');
            $("#txtNumero").focus();
            return;
        }
    
        MEU_ENDERECO = {
            cep: cep,
            endereco: endereco,
            bairro: bairro,
            cidade: cidade,
            uf: uf,
            numero: numero,
            complemento: complemento
        };
    
        // Validar endereço antes de prosseguir
        if ($("#opcaoRetirada").is(":checked") === false) {
            if (!MEU_ENDERECO || MEU_ENDERECO.uf === "-1") {
                produto.metodos.mensagem('Informe o CEP ou selecione "Retirada".');
                return;
            }
        }
    
        produto.metodos.carregarEtapa(3);
        produto.metodos.carregarResumo();
    },
    

    // carrega a etapa de Resumo do pedido
    carregarResumo: () => {
        $("#listaItensResumo").html('');
    
        $.each(MEU_CARRINHO, (i, e) => {
            let temp = produto.templates.itemResumo
                .replace(/\${img}/g, e.img)
                .replace(/\${nome}/g, e.name)
                .replace(/\${preco}/g, e.price.toFixed(2).replace('.', ','))
                .replace(/\${qntd}/g, e.qntd);
    
            $("#listaItensResumo").append(temp);
        });
    
        // Exibir Dados Pessoais
        let dadosPessoaisHTML = `
            <p><b>Nome:</b> ${MEUS_DADOS_PESSOAIS.nome}</p>
            <p><b>CPF:</b> ${MEUS_DADOS_PESSOAIS.cpf}</p>
            <p><b>Telefone:</b> ${MEUS_DADOS_PESSOAIS.telefone}</p>
            <p><b>E-mail:</b> ${MEUS_DADOS_PESSOAIS.email}</p>
        `;
        $("#resumoEndereco").html(dadosPessoaisHTML);
    
        // Exibir Endereço ou mensagem de retirada
        let enderecoHTML = $("#opcaoRetirada").is(":checked")
            ? `<p><b>Retirada no local</b></p>`
            : `
                <p><b>Endereço:</b> ${MEU_ENDERECO.endereco}, ${MEU_ENDERECO.numero}, ${MEU_ENDERECO.bairro}</p>
                <p><b>Cidade:</b> ${MEU_ENDERECO.cidade} - ${MEU_ENDERECO.uf}</p>
                <p><b>CEP:</b> ${MEU_ENDERECO.cep}</p>
                <p><b>Complemento:</b> ${MEU_ENDERECO.complemento}</p>
            `;
        $("#cidadeEndereco").html(enderecoHTML);
    
        produto.metodos.finalizarPedido();
    },
    

    // Atualiza o link do botão do WhatsApp
    finalizarPedido: () => {
        if (MEU_CARRINHO.length > 0 && MEU_ENDERECO != null) {
            let texto = 'Olá! Gostaria de fazer um pedido:';
            texto += `\n\n*Dados Pessoais:*`;
            texto += `\nNome: ${MEUS_DADOS_PESSOAIS.nome}`;
            texto += `\nCPF: ${MEUS_DADOS_PESSOAIS.cpf}`;
            texto += `\nTelefone: ${MEUS_DADOS_PESSOAIS.telefone}`;
            texto += `\nE-mail: ${MEUS_DADOS_PESSOAIS.email}`;
    
            texto += `\n\n*Itens do pedido:*\n\n\${itens}`;
            texto += '\n*Endereço de entrega:*';
    
            if ($("#opcaoRetirada").is(":checked")) {
                texto += `\nRetirada no local.`;
            } else {
                texto += `\n${MEU_ENDERECO.endereco}, ${MEU_ENDERECO.numero}, ${MEU_ENDERECO.bairro}`;
                texto += `\n${MEU_ENDERECO.cidade}-${MEU_ENDERECO.uf} / ${MEU_ENDERECO.cep} ${MEU_ENDERECO.complemento}`;
            }
    
            texto += `\n\n*Total (se optado com entrega, consultar frete): R$ ${(VALOR_CARRINHO + VALOR_ENTREGA).toFixed(2).replace('.', ',')}*`;
    
            let itens = '';
            $.each(MEU_CARRINHO, (i, e) => {
                itens += `*${e.qntd}x* ${e.name} ....... R$ ${e.price.toFixed(2).replace('.', ',')} \n`;
    
                if ((i + 1) === MEU_CARRINHO.length) {
                    texto = texto.replace(/\${itens}/g, itens);
    
                    let encode = encodeURI(texto);
                    let URL = `https://wa.me/${CELULAR_EMPRESA}?text=${encode}`;
    
                    $("#btnEtapaResumo").attr('href', URL);
                }
            });
        }
    },
    

    // carrega o link do botão atendimento
    carregarBotaoatendimento: () => {

        var texto = 'Olá! gostaria de tirar uma *dúvida*';

        let encode = encodeURI(texto);
        let URL = `https://wa.me/${CELULAR_EMPRESA}?text=${encode}`;

        $("#btnatendimento").attr('href', URL);

    },

    // carrega o botão de ligar
    carregarBotaoLigar: () => {

        $("#btnLigar").attr('href', `tel:${CELULAR_EMPRESA}`);

    },

    // abre o depoimento
    abrirDepoimento: (depoimento) => {

        $("#depoimento-1").addClass('hidden');
        $("#depoimento-2").addClass('hidden');
        $("#depoimento-3").addClass('hidden');

        $("#btnDepoimento-1").removeClass('active');
        $("#btnDepoimento-2").removeClass('active');
        $("#btnDepoimento-3").removeClass('active');

        $("#depoimento-" + depoimento).removeClass('hidden');
        $("#btnDepoimento-" + depoimento).addClass('active');

    },

    // mensagens
    mensagem: (texto, cor = 'red', tempo = 3500) => {

        let id = Math.floor(Date.now() * Math.random()).toString();

        let msg = `<div id="msg-${id}" class="animated fadeInDown toast ${cor}">${texto}</div>`;

        $("#container-mensagens").append(msg);

        setTimeout(() => {
            $("#msg-" + id).removeClass('fadeInDown');
            $("#msg-" + id).addClass('fadeOutUp');
            setTimeout(() => {
                $("#msg-" + id).remove();
            }, 800);
        }, tempo)

    }

}

produto.templates = {

    item: `
        <div class="col-12 col-lg-3 col-md-3 col-sm-6 mb-5 animated fadeInUp">
            <div class="card card-item" id="\${id}">
                <div class="img-produto">
                    <img src="\${img}" />
                </div>
                <p class="title-produto text-center mt-4">
                    <b>\${nome}</b>
                </p>
                <p class="title-descricao text-center">
                    <b>\${dsc}</b>
                </p>
                <p class="price-produto text-center">
                    <b>R$ \${preco}</b>
                </p>
                <div class="add-carrinho">
                    <span class="btn-menos" onclick="produto.metodos.diminuirQuantidade('\${id}')"><i class="fas fa-minus"></i></span>
                    <span class="add-numero-itens" id="qntd-\${id}">0</span>
                    <span class="btn-mais" onclick="produto.metodos.aumentarQuantidade('\${id}')"><i class="fas fa-plus"></i></span>
                    <span class="btn btn-add" onclick="produto.metodos.adicionarAoCarrinho('\${id}')"><i class="fa fa-shopping-bag"></i></span>
                </div>
            </div>
        </div>
    `,

    itemCarrinho: `
        <div class="col-12 item-carrinho">
            <div class="img-produto">
                <img src="\${img}" />
            </div>
            <div class="dados-produto">
                <p class="title-produto"><b>\${nome}</b></p>
                <p class="price-produto"><b>R$ \${preco}</b></p>
            </div>
            <div class="add-carrinho">
                <span class="btn-menos" onclick="produto.metodos.diminuirQuantidadeCarrinho('\${id}')"><i class="fas fa-minus"></i></span>
                <span class="add-numero-itens" id="qntd-carrinho-\${id}">\${qntd}</span>
                <span class="btn-mais" onclick="produto.metodos.aumentarQuantidadeCarrinho('\${id}')"><i class="fas fa-plus"></i></span>
                <span class="btn btn-remove no-mobile" onclick="produto.metodos.removerItemCarrinho('\${id}')"><i class="fa fa-times"></i></span>
            </div>
        </div>
    `,

    itemResumo: `
        <div class="col-12 item-carrinho resumo">
            <div class="img-produto-resumo">
                <img src="\${img}" />
            </div>
            <div class="dados-produto">
                <p class="title-produto-resumo">
                    <b>\${nome}</b>
                </p>
                <p class="price-produto-resumo">
                    <b>R$ \${preco}</b>
                </p>
            </div>
            <p class="quantidade-produto-resumo">
                x <b>\${qntd}</b>
            </p>
        </div>
    `

}
