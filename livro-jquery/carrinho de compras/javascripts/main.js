function moneyTextToFloat(text){
  var cleanText = text.replace("R$ ", "").replace(",", ".");
  return parseFloat(cleanText);
}

function floatToMoneyText(value){
  var text = "R$ " + (value < 1 ? "0" : "") + Math.floor(value * 100);
  return text.substr(0, text.length - 2) + "," + text.substr(-2);
}

function readTotal(){
  var total = $("#total").text();
  return moneyTextToFloat(total);
}

function writeTotal(value){
  var text = floatToMoneyText(value);
  $("#total").text(text);
}

function calculaTotalProdutos(){
  var produtos = $(".item");
  var total = 0;
  
  $(produtos).each(function (pos, produto){
    var $produto = $(produtos[pos]);
    
    var quantity = moneyTextToFloat($produto.find(".quantity").val());
    var price = moneyTextToFloat($produto.find(".price").text());
    total += price * quantity;
  });
  return total;
}

$(function(){
  $(".quantity").change(function (){
    writeTotal(calculaTotalProdutos());
  });
});




