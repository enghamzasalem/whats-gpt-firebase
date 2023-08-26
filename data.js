const generateHTMLCodeWithSrc = (src)=>
{
    return `
    <!DOCTYPE html>
<html>
<head>
<title>WhatsGPT</title>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css">
<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Raleway">
<link rel="stylesheet" type="text/css" href="style.css">
</head>
<body>

<div class="bgimg w3-display-container w3-animate-opacity w3-text-white">
<div class="w3-display-topleft w3-padding-large w3-xlarge">
WhatsGPT
</div>
<div class="w3-display-middle">
<center>
  <h2  class="w3-jumbo w3-animate-top">QRCode Generated</h2>
  
  <hr class="w3-border-grey" style="margin:auto;width:40%">
  <p class="w3-center"><div><img src='${src}'/></div></p>
  </center>
</div>
<div class="w3-display-bottomleft w3-padding-large">
  Powered by <a href="/" target="_blank">WhatsGPT</a>
</div>
</div>

</body>
</html>

  `
}
export default generateHTMLCodeWithSrc;