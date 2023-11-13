(function () {

    async function showEnvironmentDiv(environmentAmount) {
        var subtotalDiv = document.querySelector('.table-subtotal');
        var newDiv = document.createElement('div');

        newDiv.innerHTML = `
            <div class="switch-container">
                <div>
                    <label class="switch">
                        <input type="checkbox" id="mySwitch">
                        <span class="slider round"></span>
                    </label>
                </div>
                <div class="switch-description">Bono ambiental</div>
                <div class="switch-amount">$${environmentAmount}</div>
            </div>
        `;

        subtotalDiv.appendChild(newDiv);

        var style = document.createElement('style');
        style.textContent = `
        .switch-container {
            display: flex;
            justify-content: space-between;
        }
        .switch-description {
            display: flex;
            align-items: center;
            padding-left: 10px;
        }
        .switch-amount {
            display: flex;
            align-items: center;
        }
       /* The switch - the box around the slider */
       .switch {
        position: relative;
        display: inline-block;
        width: 60px;
        height: 34px;
       }
       
       /* Hide default HTML checkbox */
       .switch input {
        opacity: 0;
        width: 0;
        height: 0;
       }
       
       /* The slider */
       .slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #ccc;
        -webkit-transition: .4s;
        transition: .4s;
       }
       
       .slider:before {
        position: absolute;
        content: "";
        height: 26px;
        width: 26px;
        left: 4px;
        bottom: 4px;
        background-color: white;
        -webkit-transition: .4s;
        transition: .4s;
       }
       
       input:checked + .slider {
        background-color: #2196F3;
       }
       
       input:focus + .slider {
        box-shadow: 0 0 1px #2196F3;
       }
       
       input:checked + .slider:before {
        -webkit-transform: translateX(26px);
        -ms-transform: translateX(26px);
        transform: translateX(26px);
       }
       
       /* Rounded sliders */
       .slider.round {
        border-radius: 34px;
       }
       
       .slider.round:before {
        border-radius: 50%;
       }
        `;

        document.head.appendChild(style);

    }

    async function addProductToCart() {
        console.log("addProductToCart");
        if (LS.cart.items) {
            console.log("LSproduct");
            const list = [
                { pid: 190409457, vid: 764647295 }
            ];

            for (const item of list) {
                const data = new URLSearchParams();
                data.append('add_to_cart', item.pid);
                data.append('variant_id', item.vid);

                try {
                    const response = await fetch('/comprar/', {
                        method: 'POST',
                        body: data,
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        }
                    });

                    if (response.ok) {
                        console.log('success');
                    } else {
                        console.log('error');
                    }
                } catch (error) {
                    console.error('Error:', error);
                }
            }
        }
    }

    function reloadPageAfterDelay() {
        setTimeout(function () {
            window.location.reload();
        }, 200);
        switchCheckbox.checked = true;
        console.log("checked");
    }


        console.log(window.location.pathname);
    
        let environmentAmount = 10;
        showEnvironmentDiv(environmentAmount);

        let switchCheckbox = document.getElementById('mySwitch');

        if (window.location.pathname.startsWith('/checkout/v3/next/')) {
            console.log("next path");
    
    
    
            for (const item of LS.cart.items) {
                //validar que el item este seleccionado
                if (item.variant_id == 764647295) {
                    console.log("existe el producto bono");
                    switchCheckbox.checked = true;
                }
            }
    
            if (switchCheckbox) {
                console.log("existe switchCheckbox");
            } else {
                console.error("Element with ID 'mySwitch' not found");
            }
    
            switchCheckbox.addEventListener('change', async function () {
                if (switchCheckbox.checked) {
                    console.log('Switch is ON');
                    await addProductToCart();
                    reloadPageAfterDelay();
                } else {
                    console.log('Switch is OFF');
                }
            });
    
        } else {
            document.getElementsByClassName("switch-container").style.display = "none"
            console.log("start path");
        }
    
        console.log("LS");
        console.log(LS);
        console.log("LS");
    
        console.log("CART ITEMS");
        console.log(LS.cart.items);
        console.log("CART ITEMS");
    
        console.log("CART SHIPPING ADDRESS");
        console.log(LS.cart.shippingAddress);
        console.log("CART SHIPPING ADDRESS");
    
        console.log("CART SUBTOTAL");
        console.log(LS.cart.subtotal);
        console.log("CART SUBTOTAL");
    
        console.log("CART CONTACT");
        console.log(LS.cart.contact);
        console.log("CART CONTACT");

    });
