// ***** Global requires *****
const path = require("path");
const fs = require("fs");

const langService = {
  async language(lang) {

    var supported_langs = ['es', 'pt', 'en']
    let icon = 'es'

    if (!lang || lang === undefined) {
      lang = 'es'
    }
    if (!supported_langs.includes(lang)) {
      lang = 'es'
    }

    if (lang == "pt") {
      icon = 'br'
    } else if (lang == "en") {
      icon = "gb"
    } else {
      icon = "es"
    }

    const language_json = {
      "es": {
        //ESPAÑOL

        //header
        "header_products": "Productos",
        "header_docs": "Documentación",
        "header_contact": "Contacto",
        "header_login": "Iniciar Sesión",

        //index
        "index_main_title": "Tu gestión de Tiendanube, en Google Sheets",
        "index_main_subtitle": "Automatiza y gestiona tu tienda con la herramienta más usada por todas empresas de todos los tamaños",
        "index_title_section1": "Automatiza las ventas de tu tienda",
        "index_text_section1": ["Nueva venta → Nueva fila en tu Google Sheets", "¿Actualización? ¿Pago? ¿Cancelación? ¡Las filas se editan automáticamente!", "Olvídate de descargar archivos .csv"],
        "index_title_section2": "Gestiona tus productos en un mismo lugar",
        "index_text_section2": ["Mantén información actualizada de tus productos", "Crea y edita productos masivamente", "Carga imágenes desde Google Drive a tu e-commerce", "¡Todo desde Google Sheets!"],
        "index_title_section3": "Métricas, Dashboards, filtros ¡y más!",
        "index_text_section3": ["Sigue usando las mismas funciones de Google Sheets", "Genera filtros, fórmulas, tablas dinámicas, dashboards...", "Diseña tus propios gráficos, agrega colores, ¡lo que quieras!", "Y dashboards profesionales en Looker Studio"],
        "index_product_title": "Productos",
        "index_price_title": "Precios",

        //prices
        "tn_pricing_plan": [
          {
            "pricing_title": "Free",
            "pricing_price": "Gratis",
            "pricing_color": "",
            "pricing_small_text": "",
            "pricing_features": ["- Histórico de 50 ventas", "- Importación de nuevas ventas", "- Importación de productos", "- Ideal para testearlo!"],
            "pricing_button_text": "Comenzar gratis",
            "pricing_href": "/tiendanube/#"
          },
          {
            "pricing_title": "Premium",
            "pricing_price": "U$S 5",
            "pricing_color": "premium-color",
            "pricing_small_text": "/mes",
            "pricing_features": ["- Histórico total de ventas", "- Nuevas ventas automáticas", "- Dashboards", "- Edición de productos y stock"],
            "pricing_button_text": "10 días de prueba",
            "pricing_href": "/tiendanube/#"
          },
          {
            "pricing_title": "Enterprise",
            "pricing_price": "Consultar",
            "pricing_color": "enterprise-color",
            "pricing_small_text": "",
            "pricing_features": ["- Customizaciones especiales", "- Integraciones con sistemas externos", "- Soporte preferencial", "- Diseño de tienda"],
            "pricing_button_text": "Hablemos",
            "pricing_href": "/#contacto"
          }

        ],
        //plans
        "plan_title": "Comparar planes",
        "plan_headers": ["", "Free", "Premium", "Enterprise"],
        "plan_first_block": [
          ["Histórico de ventas", "Últimas 50 ventas", "Histórico", "Histórico"],
          ["Nuevas ventas", "Manual", "Automático", "Automático"],
          ["Soporte", "Documentación", "Preferencial", "Semanal"]
        ],
        "plan_first_check": ["Dashboards", "Importación de productos", "Importación de categorías"],
        "plan_second_check": ["Importación de clientes", "Edición de precios y stock", "Creación de productos y variantes", "Acceso temprano a nuevas funcionalidades"],
        "plan_third_check": ["Customizaciones especiales", "Dashboards en Looker Studio", "Integraciones con servicios externos", "Diseño de tienda"],

        //contact
        "contact_title": "Contacto",
        "contact_subtitle": "Estamos aquí para ayudarte. Responderemos rápidamente porque valoramos tu tiempo.",
        "contact_name": "Nombre y Apellido",
        "contact_email": "Email",
        "contact_message": "Mensaje",
        "contact_button": "Enviar mensaje por Whatsapp",

        //footer
        "footer_title": "Contacto",
        "privacy_policy": "Políticas de privacidad",
        "terms_conditions": "Términos y condiciones",


        //buttons
        "config_button": "Ir a configuración",
        "tn_login_button": "Login Tiendanube",
        "docs_button": "Ver documentación",
        "sheet_open_button": "Abrir Sheet",
        "sheet_clone_button": "Clonar Sheet ",
        "copy_button": "Copiar",
        "connection_id": "ID de conexión",
        "see_funcionalities": "Ver funcionalidades",
        "get_premium": "Obtener Premium",
        "manage_plan": "Gestionar plan",
        "see_demo": "Ver demo",

        //account
        "account_title": "Tu cuenta",
        "account_subtitle": "Inicia sesión con Google para gestionar más conexiones.",
        "account_first_connection": "Agrega tu primera conexión",
        "account_more_connections": "Agregar más cuentas",
        "account_connections": "Conexiones",
        "account_table": ["Conexión", "Nombre", "Plan", "Configuración"],
        "account_logout": "Cerrar sesión",

        //tn
        "tn_main_title": "Tiendanube",
        "tn_title": "Tu gestión de Tiendanube, en Google Sheets",
        "tn_subtitle": "Todos los negocios, desde las multinacionales hasta los micro emprendimientos, usan hojas de cálculo para su gestión. Usa lo mejor de los dos mundos.",
        "tn_title_section1": "Automatiza tus ventas de Tiendanube",
        "tn_text_section1": ["Cada nueva venta agrega un nuevo registro en tu planilla", "Por cada actualización, se editan las filas que correspondan", "Olvidate de descargar ventas y cargarlas manualmente"],
        "tn_title_section2": "Gestiona tus productos directamente desde Google Sheets",
        "tn_text_section2": ["Mantené actualizado tu stock en tiempo real", "Tus productos, en un solo lugar", "Edita precios y stock masivamente!"],
        "tn_title_section3": "El resto, ¡como ya conoces!",
        "tn_text_section3": ["Seguí usando las mismas funciones de Google Sheets", "Genera filtros, fórmulas, tablas dinámicas, notas ...", "Diseña tus propios gráficos, agrega colores, lo que quieras!"],


        //dt
        "dt_main_title": "Drive to Tiendanube",
        "dt_subtitle": "Carga masivamente tus imágenes de Google Drive en Tiendanube",
        "dt_second_title": "Automatiza la gestión de imágenes de tu tienda con Drive to Tiendanube",
        "dt_config_step1_subtitle": "Inicia sesión para comenzar a usar Drive to Tiendanube",
        "dt_buy_credits": "Comprar créditos",
        "dt_unredeemed_credits": "Créditos por canjear: ",
        "dt_credits_subtitle": "Para canjear el crédito debes ir al Google Sheet y clickear en Sheets Central > Canjear Créditos",
        "dt_pack1_subtitle": "Carga 250 imágenes de forma masiva desde Google Drive a Tiendanube.",
        "dt_pack2_subtitle": "Carga 1000 imágenes masivamente desde Google Drive a Tiendanube.",
        "dt_buy_button": "Comprar pack",
        "dt_migrate_title": "Migra tu e-commerce a Tiendanube",
        "dt_migrate_subtitle": "¿Deseas migrar tu Shopify, WooCommerce, VTEX, MercadoLibre a Tiendanube? ¡Escribenos!",


        //config
        "config_title": "Instrucciones",

        "config_step1_title": "Paso 1: Login Tiendanube",
        "config_step1_subtitle": "Inicia sesión con Tiendanube para comenzar a usar Sheets Central",

        "config_step2_title": "Paso 2: Clonar Google Sheet",
        "config_step2_ok": "Paso completado! Desde aquí puedes abrir tu Sheet:",
        "config_step2_config": "Clona el siguiente Google Sheet en tu propia cuenta de Google",
        "config_step2_new_version": "🚀 ¡Nueva versión disponible! 🚀",

        "config_step3_title": "Paso 3: Configurar Sheets Central",
        "config_step3_1": "1. Abre el Google Sheet recién clonado",
        "config_step3_2": "2. Copia el siguiente ID de Conexión:",
        "config_step3_3": "3. Pega el ID de Conexión en el Google Sheet, bajo el menu Sheets Central > Configuración de cuenta",

        "config_step4_title": "Paso 4: Configuración de URL",
        "config_step4_steps": [
          "1. Dentro del Google Sheet ya clonado, debes ir a Extensiones > Apps Script",
          '2. Dentro de App Script, hacer click en el botón "Implementar" > "Nueva implementación"',
          '3. Crea una nueva implementación. Importante que Cualquier usuario tenga acceso',
          "5. Copiar URL de Aplicación Web",
          "6. Volver al Sheet y click en Sheets Central > Configuración de URL",
          "7. Pegar URL de la Aplicación Web y click en Aceptar",
          "8. ¡Listo! Configuración completada"
        ],
        "config_premium": "Obtener Premium. ¡10 días de prueba!",
        "config_premium_subtitle": "Obten Sheets Central Premium y desbloquea todas las funcionalidades",
        "config_additional_title": "Material adicional",
        "config_additional_subtitle": "Revisa nuestra documentación para conocer en detalle Sheets Central",


        //shopify

        //mercado pago
      },
      "pt": {
        //header
        "header_products": "Produtos",
        "header_docs": "Documentação",
        "header_contact": "Contato",
        "header_login": "Entrar",

        //index
        "index_main_title": "Sua gestão do Nuvemshop, no Google Sheets",
        "index_main_subtitle": "Automatize e gerencie sua Nuvemshop com a ferramenta mais usada por empresas de todos os tamanhos",
        "index_title_section1": "Automatize as vendas da sua loja",
        "index_text_section1": ["Nova venda → Nova linha no seu Google Sheets", "Atualização? Pagamento? Cancelamento? As linhas são editadas automaticamente!", "Esqueça de baixar arquivos .csv"],
        "index_title_section2": "Gerencie seus produtos em um só lugar",
        "index_text_section2": ["Mantenha informações atualizadas dos seus produtos", "Crie e edite produtos em massa", "Carregue imagens do Google Drive para a sua loja virtual", "Tudo a partir do Google Sheets!"],
        "index_title_section3": "Métricas, Dashboards, filtros e muito mais!",
        "index_text_section3": ["Continue usando as mesmas funções do Google Sheets", "Crie filtros, fórmulas, tabelas dinâmicas, dashboards...", "Crie seus próprios gráficos, adicione cores, o que você quiser!", "E dashboards profissionais no Looker Studio"],
        "index_product_title": "Produtos",
        "index_price_title": "Preços",

        //prices
        "tn_pricing_plan": [
          {
            "pricing_title": "Gratuito",
            "pricing_price": "Grátis",
            "pricing_color": "",
            "pricing_small_text": "",
            "pricing_features": ["- Histórico de 50 vendas", "- Importação de novas vendas", "- Importação de produtos", "- Ideal para testar!"],
            "pricing_button_text": "Começar grátis",
            "pricing_href": "/tiendanube/#"
          },
          {
            "pricing_title": "Premium",
            "pricing_price": "U$S 5",
            "pricing_color": "premium-color",
            "pricing_small_text": "/mês",
            "pricing_features": ["- Histórico total de vendas", "- Novas vendas automáticas", "- Dashboards", "- Edição de produtos e estoque"],
            "pricing_button_text": "10 dias de teste",
            "pricing_href": "/tiendanube/#"
          },
          {
            "pricing_title": "Empresarial",
            "pricing_price": "Consultar",
            "pricing_color": "enterprise-color",
            "pricing_small_text": "",
            "pricing_features": ["- Personalizações especiais", "- Integrações com sistemas externos", "- Suporte preferencial", "- Design de loja"],
            "pricing_button_text": "Fale conosco",
            "pricing_href": "/#contacto"
          }

        ],
        //plans
        "plan_title": "Comparar planos",
        "plan_headers": ["", "Gratuito", "Premium", "Enterprise"],
        "plan_first_block": [
          ["Histórico de vendas", "Últimas 50 vendas", "Histórico", "Histórico"],
          ["Novas vendas", "Manual", "Automático", "Automático"],
          ["Suporte", "Documentação", "Preferencial", "Semanal"]
        ],
        "plan_first_check": ["Dashboards", "Importação de produtos", "Importação de categorias"],
        "plan_second_check": ["Importação de clientes", "Edição de preços e estoque", "Criação de produtos e variantes", "Acesso antecipado a novas funcionalidades"],
        "plan_third_check": ["Customizações especiais", "Dashboards no Looker Studio", "Integrações com serviços externos", "Design de loja"],

        //contact
        "contact_title": "Contato",
        "contact_subtitle": "Estamos aqui para ajudar. Responderemos rapidamente porque valorizamos seu tempo.",
        "contact_name": "Nome e Sobrenome",
        "contact_email": "Email",
        "contact_message": "Mensagem",
        "contact_button": "Enviar mensagem pelo Whatsapp",

        //footer
        "footer_title": "Contato",
        "privacy_policy": "Políticas de privacidade",
        "terms_conditions": "Termos e condições",


        //buttons
        "config_button": "Ir para configurações",
        "tn_login_button": "Login Nuvemshop",
        "docs_button": "Ver documentação",
        "sheet_open_button": "Abrir Sheet",
        "sheet_clone_button": "Clonar Sheet",
        "copy_button": "Copiar",
        "connection_id": "ID de conexão",
        "see_funcionalities": "Ver funcionalidades",
        "get_premium": "Obter Premium",
        "manage_plan": "Gerenciar plano",
        "see_demo": "Ver demo",

        //account
        "account_title": "Sua conta",
        "account_subtitle": "Faça login com o Google para gerenciar mais conexões.",
        "account_first_connection": "Adicionar sua primeira conexão",
        "account_more_connections": "Adicionar mais contas",
        "account_connections": "Conexões",
        "account_table": ["Conexão", "Nome", "Plano", "Configuração"],
        "account_logout": "Sair",

        //tn
        "tn_main_title": "Nuvemshop",
        "tn_title": "Sua gestão do Nuvemshop, no Google Sheets",
        "tn_subtitle": "Todos os negócios, desde as multinacionais até os microempreendimentos, usam planilhas para sua gestão. Use o melhor dos dois mundos.",
        "tn_title_section1": "Automatize suas vendas do Nuvemshop",
        "tn_text_section1": ["Cada nova venda adiciona um novo registro na sua planilha", "Para cada atualização, as linhas correspondentes são editadas", "Esqueça de baixar vendas e carregá-las manualmente"],
        "tn_title_section2": "Gerencie seus produtos diretamente do Google Sheets",
        "tn_text_section2": ["Mantenha seu estoque atualizado em tempo real", "Seus produtos, em um só lugar", "Edite preços e estoque em massa!"],
        "tn_title_section3": "O resto, como você já conhece!",
        "tn_text_section3": ["Continue usando as mesmas funções do Google Sheets", "Crie filtros, fórmulas, tabelas dinâmicas, notas...", "Crie seus próprios gráficos, adicione cores, o que você quiser!"],

        //dt
        "dt_main_title": "Drive para Nuvemshop",
        "dt_subtitle": "Carregue suas imagens do Google Drive para a Nuvemshop em massa",
        "dt_second_title": "Automatize o gerenciamento de imagens da sua loja com Drive para Nuvemshop",
        "dt_config_step1_subtitle": "Faça login para começar a usar o Drive para Nuvemshop",
        "dt_buy_credits": "Comprar créditos",
        "dt_unredeemed_credits": "Créditos não resgatados: ",
        "dt_credits_subtitle": "Para resgatar o crédito, vá para a Planilha do Google e clique em Sheets Central > Resgatar Créditos",
        "dt_pack1_subtitle": "Carregue 250 imagens em massa do Google Drive para a Nuvemshop.",
        "dt_pack2_subtitle": "Carregue 1000 imagens em massa do Google Drive para a Nuvemshop.",
        "dt_buy_button": "Comprar pacote",
        "dt_migrate_title": "Migre seu e-commerce para a Tiendanube",
        "dt_migrate_subtitle": "Deseja migrar seu Shopify, WooCommerce, VTEX, MercadoLivre para a Nuvemshop? Escreva para nós!",

        //config
        "config_title": "Instruções",

        "config_step1_title": "Passo 1: Login Nuvemshop",
        "config_step1_subtitle": "Faça login com Nuvemshop para começar a usar Sheets Central",

        "config_step2_title": "Passo 2: Clonar Google Sheet",
        "config_step2_ok": "Passo concluído! A partir daqui, você pode abrir sua Planilha:",
        "config_step2_config": "Clone a seguinte Planilha do Google em sua própria conta do Google",
        "config_step2_new_version": "🚀 Nova versão disponível! 🚀",

        "config_step3_title": "Passo 3: Configurar Sheets Central",
        "config_step3_1": "1. Abra a Planilha do Google recém-clonada",
        "config_step3_2": "2. Copie o seguinte ID de Conexão:",
        "config_step3_3": "3. Cole o ID de Conexão na Planilha do Google, no menu Sheets Central > Configurações da conta",

        "config_step4_title": "Passo 4: Configuração de URL",
        "config_step4_steps": [
          "1. Dentro da Planilha do Google já clonada, vá para Extensões > Apps Script",
          '2. Dentro do Apps Script, clique no botão "Implantar" > "Nova implantação"',
          '3. Crie uma nova implantação. Importante que Qualquer usuário tenha acesso',
          "5. Copie a URL da Aplicação Web",
          "6. Volte para a Planilha e clique em Sheets Central > Configuração de URL",
          "7. Cole a URL da Aplicação Web e clique em OK",
          "8. Pronto! Configuração concluída"
        ],
        "config_premium": "Obter Premium. 10 dias de teste!",
        "config_premium_subtitle": "Obtenha Sheets Central Premium e desbloqueie todas as funcionalidades",
        "config_additional_title": "Material adicional",
        "config_additional_subtitle": "Consulte nossa documentação para obter mais detalhes sobre o Sheets Central",


        //shopify

        //mercado pago

      },
      "en": {
        //ENGLISH

        //header
        "header_products": "Products",
        "header_docs": "Documentation",
        "header_contact": "Contact",
        "header_login": "Log In",

        //index
        "index_main_title": "Manage Your Tiendanube Store in Google Sheets",
        "index_main_subtitle": "Automate and manage your store with the most widely used tool for businesses of all sizes",
        "index_title_section1": "Automate Your Store’s Sales",
        "index_text_section1": ["New sale → New row in your Google Sheets", "Update? Payment? Cancellation? Rows are updated automatically!", "Forget about downloading .csv files"],
        "index_title_section2": "Manage Your Products in One Place",
        "index_text_section2": ["Keep your product information up to date", "Create and edit products in bulk", "Upload images from Google Drive to your e-commerce", "All from Google Sheets!"],
        "index_title_section3": "Metrics, Dashboards, Filters, and More!",
        "index_text_section3": ["Keep using the same Google Sheets functions", "Generate filters, formulas, pivot tables, dashboards...", "Design your own charts, add colors, anything you want!", "And professional dashboards in Looker Studio"],
        "index_product_title": "Products",
        "index_price_title": "Pricing",

        //prices
        "tn_pricing_plan": [
          {
            "pricing_title": "Free",
            "pricing_price": "Free",
            "pricing_color": "",
            "pricing_small_text": "",
            "pricing_features": ["- History of 50 sales", "- Import new sales", "- Import products", "- Ideal for testing!"],
            "pricing_button_text": "Start for Free",
            "pricing_href": "/tiendanube/#"
          },
          {
            "pricing_title": "Premium",
            "pricing_price": "U$S 5",
            "pricing_color": "premium-color",
            "pricing_small_text": "/month",
            "pricing_features": ["- Full sales history", "- Automatic new sales", "- Dashboards", "- Product and stock editing"],
            "pricing_button_text": "10-day trial",
            "pricing_href": "/tiendanube/#"
          },
          {
            "pricing_title": "Enterprise",
            "pricing_price": "Contact Us",
            "pricing_color": "enterprise-color",
            "pricing_small_text": "",
            "pricing_features": ["- Custom special features", "- Integrations with external systems", "- Priority support", "- Store design"],
            "pricing_button_text": "Let's Talk",
            "pricing_href": "/#contacto"
          }
        ],

        //plans
        "plan_title": "Compare Plans",
        "plan_headers": ["", "Free", "Premium", "Enterprise"],
        "plan_first_block": [
          ["Sales history", "Last 50 sales", "Full history", "Full history"],
          ["New sales", "Manual", "Automatic", "Automatic"],
          ["Support", "Documentation", "Priority", "Weekly"]
        ],
        "plan_first_check": ["Dashboards", "Product import", "Category import"],
        "plan_second_check": ["Customer import", "Price and stock editing", "Product and variant creation", "Early access to new features"],
        "plan_third_check": ["Custom special features", "Looker Studio dashboards", "Integrations with external services", "Store design"],

        //contact
        "contact_title": "Contact",
        "contact_subtitle": "We are here to help you. We will respond quickly because we value your time.",
        "contact_name": "Full Name",
        "contact_email": "Email",
        "contact_message": "Message",
        "contact_button": "Send message via WhatsApp",

        //footer
        "footer_title": "Contact",
        "privacy_policy": "Privacy Policy",
        "terms_conditions": "Terms and Conditions",

        //buttons
        "config_button": "Go to Settings",
        "tn_login_button": "Log in to Tiendanube",
        "docs_button": "View Documentation",
        "sheet_open_button": "Open Sheet",
        "sheet_clone_button": "Clone Sheet",
        "copy_button": "Copy",
        "connection_id": "Connection ID",
        "see_funcionalities": "View Features",
        "get_premium": "Get Premium",
        "manage_plan": "Manage Plan",
        "see_demo": "View Demo",

        //account
        "account_title": "Your Account",
        "account_subtitle": "Sign in with Google to manage more connections.",
        "account_first_connection": "Add Your First Connection",
        "account_more_connections": "Add More Accounts",
        "account_connections": "Connections",
        "account_table": ["Connection", "Name", "Plan", "Settings"],
        "account_logout": "Log Out",

        //tn
        "tn_main_title": "Tiendanube",
        "tn_title": "Manage Your Tiendanube Store in Google Sheets",
        "tn_subtitle": "All businesses, from multinational corporations to micro-enterprises, use spreadsheets for management. Use the best of both worlds.",
        "tn_title_section1": "Automate Your Tiendanube Sales",
        "tn_text_section1": ["Each new sale adds a new entry to your spreadsheet", "For every update, the corresponding rows are edited", "Forget about downloading and manually uploading sales"],
        "tn_title_section2": "Manage Your Products Directly from Google Sheets",
        "tn_text_section2": ["Keep your stock updated in real time", "Your products, all in one place", "Edit prices and stock in bulk!"],
        "tn_title_section3": "Everything Else, Just as You Know It!",
        "tn_text_section3": ["Keep using the same Google Sheets functions", "Generate filters, formulas, pivot tables, notes...", "Design your own charts, add colors, anything you want!"],

        //dt
        "dt_main_title": "Drive to Tiendanube",
        "dt_subtitle": "Bulk upload your images from Google Drive to Tiendanube",
        "dt_second_title": "Automate Your Store’s Image Management with Drive to Tiendanube",
        "dt_config_step1_subtitle": "Log in to start using Drive to Tiendanube",
        "dt_buy_credits": "Buy Credits",
        "dt_unredeemed_credits": "Credits to Redeem: ",
        "dt_credits_subtitle": "To redeem your credits, go to Google Sheets and click on Sheets Central > Redeem Credits",
        "dt_pack1_subtitle": "Upload 250 images in bulk from Google Drive to Tiendanube.",
        "dt_pack2_subtitle": "Upload 1000 images in bulk from Google Drive to Tiendanube.",
        "dt_buy_button": "Buy Pack",
        "dt_migrate_title": "Migrate Your E-commerce to Tiendanube",
        "dt_migrate_subtitle": "Do you want to migrate your Shopify, WooCommerce, VTEX, MercadoLibre store to Tiendanube? Contact us!",

        //config
        "config_title": "Instructions",

        "config_step1_title": "Step 1: Log in to Tiendanube",
        "config_step1_subtitle": "Log in to Tiendanube to start using Sheets Central",

        "config_step2_title": "Step 2: Clone Google Sheet",
        "config_step2_ok": "Step Completed! You can open your Sheet from here:",
        "config_step2_config": "Clone the following Google Sheet into your own Google account",
        "config_step2_new_version": "🚀 New version available! 🚀",

        "config_step3_title": "Step 3: Configure Sheets Central",
        "config_step3_1": "1. Open the newly cloned Google Sheet",
        "config_step3_2": "2. Copy the following Connection ID:",
        "config_step3_3": "3. Paste the Connection ID into the Google Sheet under Sheets Central > Account Settings",

        "config_step4_title": "Step 4: URL Configuration",
        "config_step4_steps": [
          "1. In the cloned Google Sheet, go to Extensions > Apps Script",
          '2. Inside Apps Script, click on the "Deploy" button > "New Deployment"',
          '3. Create a new deployment. Make sure that anyone can access it',
          "5. Copy the Web Application URL",
          "6. Go back to the Sheet and click on Sheets Central > URL Configuration",
          "7. Paste the Web Application URL and click Accept",
          "8. Done! Configuration complete"
        ],
        "config_premium": "Get Premium. 10-day trial!",
        "config_premium_subtitle": "Get Sheets Central Premium and unlock all features",
        "config_additional_title": "Additional Material",
        "config_additional_subtitle": "Check our documentation to learn more about Sheets Central"
        

        //shopify

        //mercado pago
      }
    }





    //return object
    let return_object = {
      lang,
      icon,
      "text": language_json[lang]

    }
    return return_object


  }
};

module.exports = langService;