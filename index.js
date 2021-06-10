
var customIcons = {
  Facil: {
    icon: 'http://labs.google.com/ridefinder/images/mm_20_green.png'
  },
  Medio: {
    icon: 'http://labs.google.com/ridefinder/images/mm_20_yellow.png'
  },
  Dificil: {
    icon: 'http://labs.google.com/ridefinder/images/mm_20_red.png'
  },
  apagar: {
    icon: 'http://labs.google.com/ridefinder/images/mm_20_black.png'
  }
}

var customColorByDifuculty = {
  Facil: {
    color: "#006400"
  },
  Medio: {
    color: "#FFD700"
  },
  Dificil: {
    color: "#8B0000"
  }
};

var selectedMarker;
var hasMarkerSelected;
//marcadores google (para a legenda)
var marcas=new Array();
//trilhos google (para a legenda)
var trilhos=new Array();
//info de trilhos vinda do ficheiro XML - postgresql
var trails=new Array();
var bounds;
var map;
const mapCenter = {lat: 38.737317071, lng: -27.269361184};

var vizualization;

function initMap() {
  
  var mapOptions = {
    zoom: 8,
    center: mapCenter,
    mapTypeId: "terrain",
  };
  
  vizualization = new google.load("visualization", "1", { packages: ["columnchart"] });

  map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);

  //bounds object of current zoom - full extent dependent on the selected categories
	bounds=new google.maps.LatLngBounds(mapCenter, mapCenter);

  downloadUrl("xmloutdomPostgresql.php", (data) => {
    let xml = data.responseXML;
    
    processXMLfile(xml);
   
    //pan back to marker
    map.addListener("center_changed", function() {
      //3 seconds after the center of the map has changed. pan back to the marker
       window.setTimeout(() => {
         if(hasMarkerSelected)
          map.panTo(selectedMarker.getPosition())
          else doNothing();
        ;
      }, 5000);
    })
  });
}

function processXMLfile(xml) {

const elevator = new google.maps.ElevationService();
let infoWindow = new google.maps.InfoWindow;

var xmlTrails = new Array();
xmlTrails = xml.documentElement.getElementsByTagName("trilho");

for(let i = 0; i < xmlTrails.length; i++) {
  trails.push(xmlTrails[i]);
}

  for (let i = 0; i < trails.length; i++) {
    let nome = trails[i].getAttribute("nome");
    let pathCoordinates = trails[i].getAttribute("path");
    let forma = trails[i].getAttribute("forma");
    
    let dificuldade = trails[i].getAttribute("dificuldade");

  

    let extensao = trails[i].getAttribute("extensao");
    let duracao = trails[i].getAttribute("duracao");

    let descricao = trails[i].getAttribute("descricao");
    
   var arrayPath = parseToArrayPath(pathCoordinates);
 
    let point = new google.maps.LatLng(
     parseFloat(arrayPath[0].lat),
     parseFloat(arrayPath[0].lng));
    
    let html = '<p style="text-align: center;"><strong><span style="font-size: 20px;">'+nome+'</span></strong></p>'+
    '<p><strong><span style="font-size: 14px;">Forma&nbsp;</span></strong><span style="font-size: 14px;"> - '+forma+'</span></p>'+
    '<p><span style="font-size: 14px;"><strong>Dificuldade</strong> - '+dificuldade+'</span></p>' +
    '<p><span style="font-size: 14px;"><strong>Extens&atilde;o</strong> - '+extensao+'</span></p>' +
    '<p><span style="font-size: 14px;"><strong>Dura&ccedil;&atilde;o</strong> - '+duracao+'</span></p>' +
    '<p><span style="font-size: 14px;"><strong>Descri&ccedil;&atilde;o</strong> - '+descricao+'</span></p>';

    let icon = customIcons[dificuldade.normalize('NFD').replace(/[\u0300-\u036f]/g, '')] || {};
   
    marcas[i] = new google.maps.Marker({
      map: map,
      position: point,
      title: nome,
      icon: icon.icon
     });
     
     let color = customColorByDifuculty[dificuldade.normalize('NFD').replace(/[\u0300-\u036f]/g, '')] || {};

     trilhos[i] = new google.maps.Polyline({
       path: arrayPath,
       geodesic: true,
       strokeColor: color.color,
       strokeOpacity: 1.0,
       strokeWeight: 2,
      });

     trilhos[i].setMap(map);

     bindInfoWindow(marcas[i], map, infoWindow, html, arrayPath, elevator);
     bindRemove(marcas[i], nome);

     bounds.extend(point);


   //click on the marker change zoom and center
   marcas[i].addListener("click", function() {
     map.setZoom(13);
     map.setCenter(marcas[i].getPosition());
     hasMarkerSelected = true;
     selectedMarker = marcas[i];  
   });   
 }  
}

function readSingleFile(e) {
  var file = e.target.files[0].name;
  if (!file) {
    return;
  }

  var xml;
  downloadUrl(file, (data) => {
    xml = data.responseXML;
    console.log(xml);
    
    processXMLfile(xml);

    var checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = file;
      checkbox.name = file;
      checkbox.value = file;
      checkbox.checked = true;
         
      checkbox.addEventListener('change', function() {
   
        var xmlTrails = new Array();
        xmlTrails = xml.documentElement.getElementsByTagName("trilho");

        
        for(let i = 0; i < xmlTrails.length; i++) {
          var temp = xmlTrails[i].getAttribute("nome");
          for(let j = 0; j < trails.length; j++) {
            if(temp == trails[j].getAttribute("nome")) {
            marcas[j].setVisible(this.checked); 
            trilhos[j].setVisible(this.checked);
            }
          }
        }

      });
  
      var label = document.createElement('label')
      label.htmlFor = file;
      label.appendChild(document.createTextNode(file));
  
      var br = document.createElement('br');
   
      var container = document.getElementById('fileList');
      container.appendChild(checkbox);
      container.appendChild(label);
      container.appendChild(br);
  })
}

function removeLayers() {
  location.reload();
}


function parseToArrayPath(pathCoordinates) {
  var res = pathCoordinates.substring(0, pathCoordinates.length-1) + '';
  res = res.replace('LINESTRING(', '');
  
  var temp = res.split(',');
  var arrayPath = [];
 
  for(let i = 0; i < temp.length; i++) {
    var temp1 = temp[i].split(" ");
    var coordinates = '{"lng":' + temp1[0] + ', "lat":' + temp1[1] + '}' ;
    arrayPath.push(JSON.parse(coordinates))
  }
 
 return arrayPath;
}


function plotElevation(elevations, status) {

  const chartDiv = document.getElementById("elevation-chart");
  if (status !== "OK") {
    // Show the error code inside the chartDiv.
    chartDiv.innerHTML =
      "Cannot show elevation: request failed because " + status;
    return;
  }
 
  const chart = new google.visualization.ColumnChart(chartDiv);
 
  const data = new google.visualization.DataTable();
  data.addColumn("string", "Sample");
  data.addColumn("number", "Elevation");

  for (let i = 0; i < elevations.length; i++) {
    data.addRow(["", elevations[i].elevation]);
  }
 
  chart.draw(data, {
    height: 150,
    legend: "none",
    titleY: "Elevação (m)",
    titleX: "Distência",
    colors: ['#228B22']
  });
}

function updateZoom() {
  hasMarkerSelected = false;
  map.fitBounds(bounds);
}

function checkLegend() {

  //bounds object of current zoom - full extent dependent on the selected categories
	bounds=new google.maps.LatLngBounds(mapCenter, mapCenter);
	
	var legenda=document.getElementById("legenda");
	var facil=legenda.elements[0];
	var medio=legenda.elements[1];
	var dificil=legenda.elements[2];
  
	for(var j=0; j<marcas.length; j++) {
		
		switch (trails[j].getAttribute("dificuldade")[0]) {
      case 'F': 
                 marcas[j].setVisible(facil.checked); 
                trilhos[j].setVisible(facil.checked); break;
      
      case 'M':  marcas[j].setVisible(medio.checked); 
                trilhos[j].setVisible(medio.checked); break;
    
      case 'D':  marcas[j].setVisible(dificil.checked); 
                trilhos[j].setVisible(dificil.checked); break;
		}

    
    //if category is visible, full extent will include the marker
		if (marcas[j].getVisible())
      bounds.extend(marcas[j].getPosition());
	}
  updateZoom(); //zoom may be updated at this point, or not.
}


function bindInfoWindow(marker, map, infoWindow, html, arrayPath, elevator) {  
  google.maps.event.addListener(marker, 'click', ()=> {

    infoWindow.setContent(html);
    infoWindow.open(map, marker);

    // Create a PathElevationRequest object using this array.
    // Ask for 512 samples along that path.
    // Initiate the path request.
    elevator.getElevationAlongPath({path: arrayPath,samples: 512},plotElevation);
  });
}

function bindRemove(marker,name){
	google.maps.event.addListener(marker, 'dblclick', () => {
				let apaga=document.getElementById("del");
				let n=apaga.elements[0];
				n.value=name;
				marker.setIcon(customIcons['apagar'].icon);
	});
}

function downloadUrl(url,callback) {
  let request = window.ActiveXObject ?
      new ActiveXObject('Microsoft.XMLHTTP') :
      new XMLHttpRequest;
 
  request.onreadystatechange = ()=> {
    if (request.readyState == 4) {
      request.onreadystatechange = doNothing;
      callback(request, request.status);
    }
  };
 
  request.open('GET', url, true);
  request.send(null);
 }
 
function doNothing() {}







