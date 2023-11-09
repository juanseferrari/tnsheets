(function () {
    // Your JavaScript


    // PRUBEAA 2


    // Get the div element with class "table-subtotal"
    var subtotalDiv = document.querySelector('.table-subtotal');
    var newDiv = document.createElement('div');

    // Set the HTML content of the subtotalDiv using innerHTML
    newDiv.innerHTML = `
<div class="switch-container">
  <!-- Rounded switch -->
  <div>
    <label class="switch">
        <input type="checkbox" id="mySwitch">
        <span class="slider round"></span>
    </label>
  </div>
  <!-- Description -->
  <div class="switch-description">Bono ambiental</div>
  <div class="switch-amount">$1</div>

</div>
`;

    subtotalDiv.appendChild(newDiv);



    // Set the height of the parent div to 20px
    //subtotalDiv.style.height = '20px';

    // Create a style element
    var style = document.createElement('style');

    // Set the CSS rules as text content
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

    // Append the style element to the document's head
    document.head.appendChild(style);


    // Get the checkbox element
    var switchCheckbox = document.getElementById('mySwitch');

    // Check the state of the switch when it is clicked
    switchCheckbox.addEventListener('change', function () {
        if (switchCheckbox.checked) {
            console.log('Switch is ON');
        } else {
            console.log('Switch is OFF');
        }
    });



    console.log("LS")
    console.log(LS)
    console.log("LS")

    console.log("CART ITEMS")
    console.log(LS.cart.items)
    console.log("CART ITEMS")

    console.log("CART SHIPPING ADDRESS")
    console.log(LS.cart.shippingAddress)
    console.log("CART SHIPPING ADDRESS")

    console.log("CART SUBTOTAL")
    console.log(LS.cart.subtotal)
    console.log("CART SUBTOTAL")

    console.log("CART CONTACT")
    console.log(LS.cart.contact)
    console.log("CART CONTACT")
})();

