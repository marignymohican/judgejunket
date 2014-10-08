$(document).ready(function(){
	//-[O_o]-//
	var mapOptions = {
			zoomControl: true,
			zoomControlOptions: {
				style: google.maps.ZoomControlStyle.DEFAULT,
				position: google.maps.ControlPosition.TOP_LEFT
			},
			mapTypeControl: false,
			panControl: false,
			streetViewControl: false,
			styles: mapstyles[4]
		};

	var map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
	var oms = new OverlappingMarkerSpiderfier(map);
	var markers = [];
	var paths = [];
	var infowindow = new google.maps.InfoWindow();

	// set a marker at Carrollton & Claiborne
	var crescenthub = new google.maps.Marker({
			position: {lat:29.97457, lng:-90.10068},
			map: map,			
			icon: {
				url: '/maps/icons/dot-red-med.png',
				size: new google.maps.Size(18,18),
				scaledSize: new google.maps.Size(18,18),
				origin: new google.maps.Point(0,0),
				anchor: new google.maps.Point(9,9),
			}
		});

	var tLat,tlon;
	for ( var i in judges ){
		$('<option>' + judges[i]['name'] + '</option>')
			.data('triplist',judges[i]['trips'])
			.appendTo('#jnames');
	}
	// initial map to display
	traceroutes(judges[4]['trips']);
	$('#jnames option:eq(4)').attr('selected',true);
	// initial map to display

	$('#jnames').change(function(e){
		removeMarkers();
		var t = $('#jnames option:selected').data('triplist');
		traceroutes(t);
	});

	function traceroutes(jj){
		var cpt = 0;
		var bounds = new google.maps.LatLngBounds();
		bounds.extend(new google.maps.LatLng(29.97457,-90.10068)); // reset bounds from the new orleans "center" dot

		$('#jtrips').empty();
		jj.sort(
			function(a,b){
				// new Date(year, month, day)
				var atrip = new Date(a['Trip start'].split('/')[2],a['Trip start'].split('/')[0],a['Trip start'].split('/')[1]);
				var btrip = new Date(b['Trip start'].split('/')[2],b['Trip start'].split('/')[0],b['Trip start'].split('/')[1]);
				if ( atrip > btrip ){
					return 1
				}
				if ( atrip < btrip){
					return -1
				}
				return 0
			}
		);

		for ( var i in jj ){
			var cp = jj[i]['Court paid'];
			cp = cp.replace('$','').replace(',','');
			cpt = cpt + Number(cp)

			// add a dot to the destination
			tLat = jj[i]['Venue']['LatLon'].split(',')[0];
			tLon = jj[i]['Venue']['LatLon'].split(',')[1];			

			var marker = new google.maps.Marker({
				map: map,
				position: new google.maps.LatLng(tLat,tLon),
				icon: {
					url: '/maps/icons/' + jj[i]['type'] + '-map-icon-black.png',
					size: new google.maps.Size(18,18),
					scaledSize: new google.maps.Size(18,18),
					origin: new google.maps.Point(0,0),
					anchor: new google.maps.Point(9,7),
					}
			});
			$(marker).data('tripinfo', jj[i]);
			markers.push(marker);

			bounds.extend(new google.maps.LatLng(tLat,tLon))
			map.fitBounds(bounds);

			oms.addListener('click', function(marker,event) {
				var ti = $(marker).data('tripinfo');
				infowindow.setContent(
					'<div id="jj">' + 
						'<h3>' + ti['Reason for trip'] + '</h3>' +
						'<hr />' +
						ti['Trip start'] + ' to ' + ti['Trip end'] + '<br />' +
						ti['Venue']['name'] + '<br />' +
						ti['City'] + ', ' + ti['State'] + '<br />' +
						'Court paid: <strong>' + ti['Court paid'] + '</strong>' +
					'</div>'
				);
				infowindow.open(map, marker);
			});
			oms.addMarker(marker);

			// line for the trip path
			var begEnd = [
					new google.maps.LatLng(29.97457,-90.10068),
					new google.maps.LatLng(tLat,tLon),
				];
			var tripPathColor;
			if ( jj[i]['Trip start'].indexOf('/13') >= 0 ){
				tripPathColor = '#FF0000'
			} else {
				tripPathColor = '#0000FF'
			}
			var tripPath = new google.maps.Polyline({
					path: begEnd,
					geodesic: true,
					strokeColor: tripPathColor,
					strokeOpacity: 1.0,
					strokeWeight: 2
				});
			tripPath.setMap(map);
			paths.push(tripPath);

			// populate the list
			$('#jtrips').append( 
				$('<li />').html(
					'<div>' + jj[i]['Trip start'] + ' to ' + jj[i]['Trip end'] + '</div>' + 
					'<div>' + jj[i]['Reason for trip'] + '<br />' + '</div>' +
					'<div>' + jj[i]['Court paid'] + '</div>'
				).data('lat',tLat).data('lon',tLon)
			);
		}
		$('#jtrips').append('<li id="cptotal"><div></div><div>total = </div><div>$' + cpt.toFixed(2) + '</div></li>');
	}
	// pan to dot when list clicked
	$('#jtrips').on('click','li',function(){
		map.panTo({lat: Number($(this).data('lat')), lng: Number($(this).data('lon'))});
		map.setZoom(8);
	});
	
	function removeMarkers(){
		for ( var i = 0; i < markers.length; i++ ){
			markers[i].setMap(null);
			paths[i].setMap(null);
		}
		markers = [];
		paths = [];
	}
	
});

var judges = [
	{
		"name": "Camille Buras",
		"trips": [
			{
				"Reason for trip": "Court Technology Conference",
				"type": "plane",
				"Venue": 
					{
						"name": "Baltimore Convention Center",
						"LatLon": "39.285507,-76.61651"
					},
				"City": "Baltimore",
				"State": "MD",
				"Trip start": "9/17/13",
				"Trip end": "9/19/13",
				"Court paid": " $2,220.68 "
			},
    		{
				"Reason for trip": "Bench Bar CLE",
				"type": "car",
				"Venue": 
					{
						"name": "Beau Rivage Resort",
						"LatLon": "30.3925211,-88.8914355"
					},
				"City": "Biloxi",
				"State": "MS",
				"Trip start": "4/19/13",
				"Trip end": "4/21/13",
				"Court paid": " $219.01 "
			},
			{
				"Reason for trip": "Spring Judges Conference (LA Judicial College)",
				"type": "car",
				"Venue": 
					{
						"name": "Hilton Lafayette",
						"LatLon": "30.1961512,-92.01563820000001"
					},
				"City": "Lafayette",
				"State": "LA",
				"Trip start": "4/11/13",
				"Trip end": "4/12/13",
				"Court paid": " $656.85 "
			},
			{
				"Reason for trip": "New York, New York: A Multitopic CLE Seminar",
				"type": "plane",
				"Venue": 
					{
						"name": "Millennium Broadway Hotel",
						"LatLon": "40.75719,-73.984446"
					},
				"City": "New York",
				"State": "NY",
				"Trip start": "11/23/13",
				"Trip end": "11/25/13",
				"Court paid": " $2,742.76 "
			}
		]
	},
	{
		"name": "Harry Cantrell",
		"trips":
			[
				{
					"Reason for trip": "National Bar Association Convention",
					"type": "plane",
					"Venue": 
						{
							"name": "Atlanta Marriott Marquis",
							"LatLon": "33.761553,-84.384736"
						},
					"City": "Atlanta",
					"State": "GA",
					"Trip start": "7/26/14",
					"Trip end": "8/1/14",
					"Court paid": " $475.00 "
				},
				{
					"Reason for trip": "Bench Bar CLE",
					"type": "car",
					"Venue": 
						{
							"name": "Beau Rivage Resort",
							"LatLon": "30.3925211,-88.8914355"
						},
					"City": "Biloxi",
					"State": "MS",
					"Trip start": "4/4/14",
					"Trip end": "4/6/14",
					"Court paid": " $645.77 "
				},
				{
					"Reason for trip": "Joint Summer School/LSBA Annual Meeting",
					"type": "car",
					"Venue": 
						{
							"name": "Sandestin Golf and Beach Resort",
							"LatLon": "30.3855564,-86.39700070000004"
						},
					"City": "Destin",
					"State": "FL",
					"Trip start": "5/31/14",
					"Trip end": "6/7/14",
					"Court paid": " $3,673.42 "
				}
			]
	},
	{
		"name": "Darryl Derbigny",
		"trips":
			[
				{
					"Reason for trip": "American Association for Justice Conference",
					"type": "plane",
					"Venue": 
						{
							"name": "Wyndham San Francisco",
							"LatLon": "37.7849258,-122.4089419"
						},
					"City": "San Francisco",
					"State": "CA",
					"Trip start": "7/19/13",
					"Trip end": "7/24/13",
					"Court paid": " $2,882.05 "
				},
				{
					"Reason for trip": "Joint Summer School/LSBA Annual Meeting",
					"type": "car",
					"Venue": 
						{
							"name": "Sandestin Golf and Beach Resort",
							"LatLon": "30.3855564,-86.39700070000004"
						},
					"City": "Destin",
					"State": "FL",
					"Trip start": "6/3/13",
					"Trip end": "6/8/13",
					"Court paid": " $3,060.50 "
				},
				{
					"Reason for trip": "Joint Summer School/LSBA Annual Meeting",
					"type": "car",
					"Venue": 
						{
							"name": "Sandestin Golf and Beach Resort",
							"LatLon": "30.3855564,-86.39700070000004"
						},
					"City": "Destin",
					"State": "FL",
					"Trip start": "6/1/14",
					"Trip end": "6/6/14",
					"Court paid": " $3,645.68 "
				}
			]
	},
	{
		"name": "Tracey Flemings-Davillier",
		"trips":
			[
				{
					"Reason for trip": "Bench Bar CLE",
					"type": "car",
					"Venue": 
						{
							"name": "Beau Rivage Resort",
							"LatLon": "30.3925211,-88.8914355"
						},
					"City": "Biloxi",
					"State": "MS",
					"Trip start": "4/19/13",
					"Trip end": "4/21/13",
					"Court paid": " $586.23 "
				},
				{
					"Reason for trip": "National Association of Drug Court Professionals Training Conference",
					"type": "plane",
					"Venue": 
						{
							"name": "Doubletree Hotel",
							"LatLon": "33.788273,-117.891882"
						},
					"City": "Anaheim",
					"State": "CA",
					"Trip start": "5/27/14",
					"Trip end": "5/31/14",
					"Court paid": " $605.00 "
				},
				{
					"Reason for trip": "National Association of Drug Court Professionals Training Conference",
					"type": "plane",
					"Venue": 
						{
							"name": "Gaylord National Resort and Convention Center",
							"LatLon": "38.780872,-77.017075"
						},
					"City": "National Harbor (Washington)",
					"State": "MD",
					"Trip start": "7/14/13",
					"Trip end": "7/17/13",
					"Court paid": " $2,187.45 "
				},
				{
					"Reason for trip": "Joint Summer School/LSBA Annual Meeting",
					"type": "car",
					"Venue": 
						{
							"name": "Sandestin Golf and Beach Resort",
							"LatLon": "30.3855564,-86.39700070000004"
						},
					"City": "Destin",
					"State": "FL",
					"Trip start": "6/1/13",
					"Trip end": "6/5/13",
					"Court paid": " $2,497.14 "
				}
			]
	},
	{
		"name": "Arthur Hunter",
		"trips":
			[
				{
					"Reason for trip": "National Consortium on Racial and Ethnic Fairness in the Courts",
					"type": "plane",
					"Venue": 
						{
							"name": "",
							"LatLon": "44.52634219999999,-109.05653080000002"
						},
					"City": "Cody",
					"State": "WY",
					"Trip start": "6/25/14",
					"Trip end": "6/29/14",
					"Court paid": " $1,131.50 "
				},
				{
					"Reason for trip": "Bench Bar CLE",
					"type": "car",
					"Venue": 
						{
							"name": "Beau Rivage Resort",
							"LatLon": "30.3925211,-88.8914355"
						},
					"City": "Biloxi",
					"State": "MS",
					"Trip start": "4/4/14",
					"Trip end": "4/6/14",
					"Court paid": " $645.77 "
				},
				{
					"Reason for trip": "Harvard Law School Trial Advocacy Group",
					"type": "plane",
					"Venue": 
						{
							"name": "Harvard Square Hotel",
							"LatLon": "42.37282889999999,-71.12192319999997"
						},
					"City": "Cambridge",
					"State": "MA",
					"Trip start": "1/20/14",
					"Trip end": "1/25/14",
					"Court paid": " $590.00 "
				},
				{
					"Reason for trip": "Educational Summit for State Court Judges",
					"type": "plane",
					"Venue": 
						{
							"name": "Hyatt Regency Denver Tech Center",
							"LatLon": "39.6303534,-104.8992771"
						},
					"City": "Denver",
					"State": "CO",
					"Trip start": "9/18/13",
					"Trip end": "9/20/13",
					"Court paid": " $1,248.44 "
				},
				{
					"Reason for trip": "Justice for Vets' Vet Court Conference",
					"type": "plane",
					"Venue": 
						{
							"name": "Marriott Wardman Park Hotel",
							"LatLon": "38.9250029,-77.05339500000002"
						},
					"City": "Washington",
					"State": "DC",
					"Trip start": "12/1/13",
					"Trip end": "12/5/13",
					"Court paid": " $2,572.12 "
				},
				{
					"Reason for trip": "Joint Summer School/LSBA Annual Meeting",
					"type": "car",
					"Venue": 
						{
							"name": "Sandestin Golf and Beach Resort",
							"LatLon": "30.3855564,-86.39700070000004"
						},
					"City": "Destin",
					"State": "FL",
					"Trip start": "6/2/13",
					"Trip end": "6/5/13",
					"Court paid": " $2,028.60 "
				},
				{
					"Reason for trip": "Joint Summer School/LSBA Annual Meeting",
					"type": "car",
					"Venue": 
						{
							"name": "Sandestin Golf and Beach Resort",
							"LatLon": "30.3855564,-86.39700070000004"
						},
					"City": "Destin",
					"State": "FL",
					"Trip start": "5/31/14",
					"Trip end": "6/6/14",
					"Court paid": " $2,799.62 "
				},
				{
					"Reason for trip": "LA Judicial Council CLE",
					"type": "car",
					"Venue": 
						{
							"name": "Staybridge Suites Hotel",
							"LatLon": "30.1922236,-92.0134889999999"
						},
					"City": "Lafayette",
					"State": "LA",
					"Trip start": "3/6/14",
					"Trip end": "3/9/14",
					"Court paid": " $1,006.81 "
				},
				{
					"Reason for trip": "Handling Capital Cases - National Judicial College",
					"type": "plane",
					"Venue": 
						{ 
							"name": "Westin Riverwalk Hotel",
							"LatLon": "29.4234768,-98.49009160000003"
						},
					"City": "San Antonio",
					"State": "TX",
					"Trip start": "11/3/13",
					"Trip end": "11/7/13",
					"Court paid": " $3,073.84 "
				},
				{
					"Reason for trip": "LA Judicial Council CLE",
					"type": "car",
					"Venue": 
						{
							"name": "",
							"LatLon": "30.4582829,-91.1403196"
						},
					"City": "Baton Rouge",
					"State": "LA",
					"Trip start": "2/14/13",
					"Trip end": "2/17/13",
					"Court paid": " $250.00 "
				},
				{
					"Reason for trip": "U.S. Sentencing Reform conference *",
					"type": "plane",
					"Venue": 
						{
							"name": "",
							"LatLon": "41.9990903,21.4248902"
						},
					"City": "Skopje",
					"State": "Macedonia",
					"Trip start": "5/11/13",
					"Trip end": "5/14/13",
					"Court paid": ""
				}
			]
	},
	{
		"name": "Keva Landrum-Johnson",
		"trips":
			[
				{
					"Reason for trip": "Bench Bar CLE",
					"type": "car",
					"Venue": 
						{
							"name": "Beau Rivage Resort",
							"LatLon": "30.3925211,-88.8914355"
						},
					"City": "Biloxi",
					"State": "MS",
					"Trip start": "4/19/13",
					"Trip end": "4/21/13",
					"Court paid": " $545.00 "
				},
				{
					"Reason for trip": "LA Judicial Leadership Institute",
					"type": "car",
					"Venue": 
						{
							"name": "Nottoway Plantation",
							"LatLon": "30.182839,-91.170158"
						},
					"City": "White Castle",
					"State": "LA",
					"Trip start": "9/11/13",
					"Trip end": "9/14/13",
					"Court paid": " $2,414.74 "
				},
				{
					"Reason for trip": "Joint Summer School/LSBA Annual Meeting",
					"type": "car",
					"Venue": 
						{
							"name": "Sandestin Golf and Beach Resort",
							"LatLon": "30.3855564,-86.39700070000004"
						},
					"City": "Destin",
					"State": "FL",
					"Trip start": "6/2/13",
					"Trip end": "6/7/13",
					"Court paid": " $3,443.50 "
				},
				{
					"Reason for trip": "Joint Summer School/LSBA Annual Meeting",
					"type": "car",
					"Venue": 
						{
							"name": "Sandestin Golf and Beach Resort",
							"LatLon": "30.3855564,-86.39700070000004"
						},
					"City": "Destin",
					"State": "FL",
					"Trip start": "5/31/14",
					"Trip end": "6/7/14",
					"Court paid": " $4,096.50 "
				},
				{
					"Reason for trip": "LA Judicial Leadership Institute",
					"type": "car",
					"Venue": 
						{
							"name": "Springhill Suites by Marriott",
							"LatLon": "30.167818,-92.040477"
						},
					"City": "Lafayette",
					"State": "LA",
					"Trip start": "11/7/13",
					"Trip end": "11/8/13",
					"Court paid": " $425.15 "
				}
			]
	},
	{
		"name": "Frank Marullo",
		"trips":
			[
				{
					"Reason for trip": "Spring Judges Conference (LA Judicial College)",
					"type": "car",
					"Venue": 
						{
							"name": "Hilton Lafayette",
							"LatLon": "30.1961512,-92.01563820000001"
						},
					"City": "Lafayette",
					"State": "LA",
					"Trip start": "4/9/14",
					"Trip end": "4/11/14",
					"Court paid": " $1,149.64 "
				},
				{
					"Reason for trip": "American Institute for Justice Conference",
					"type": "plane",
					"Venue": 
						{
							"name": "Kandahar Mountain Lodge",
							"LatLon": "48.480541,-114.358728"
						},
					"City": "Whitefish",
					"State": "MT",
					"Trip start": "6/21/14",
					"Trip end": "6/28/14",
					"Court paid": " $3,888.40 "
				},
				{
					"Reason for trip": "Joint Summer School/LSBA Annual meeting",
					"type": "car",
					"Venue": 
						{
							"name": "Sandestin Golf and Beach Resort",
							"LatLon": "30.3855564,-86.39700070000004"
						},
					"City": "Destin",
					"State": "FL",
					"Trip start": "6/2/14",
					"Trip end": "6/6/14",
					"Court paid": " $1,583.50 "
				},
				{
					"Reason for trip": "CLE of Louisiana Conference",
					"type": "plane",
					"Venue": 
						{
							"name": "Westin Playa Bonita",
							"LatLon": "8.898555,-79.576507"
						},
					"City": "Panama City",
					"State": "Panama",
					"Trip start": "7/10/13",
					"Trip end": "7/18/13",
					"Court paid": " $4,452.40 "
				}
			]
	},
	{
		"name": "Julian Parker",
		"trips":
			[
				{
					"Reason for trip": "National Association of Drug Court Professionals Training Conference",
					"type": "plane",
					"Venue": 
						{
							"name": "Gaylord National Resort and Convention Center",
							"LatLon": "38.780872,-77.017075"
						},
					"City": "National Harbor (Washington)",
					"State": "MD",
					"Trip start": "7/13/13",
					"Trip end": "7/17/13",
					"Court paid": "$265.00"
				}
			]
	},
	{
		"name": "Robin Pittman",
		"trips":
			[
				{
					"Reason for trip": "Bench Bar CLE",
					"type": "car",
					"Venue": 
						{
							"name": "Beau Rivage Resort",
							"LatLon": "30.3925211,-88.8914355"
						},
					"City": "Biloxi",
					"State": "MS",
					"Trip start": "4/4/14",
					"Trip end": "4/6/14",
					"Court paid": " $395.77 "
				},
				{
					"Reason for trip": "Joint Summer School/LSBA Annual Meeting",
					"type": "car",
					"Venue": 
						{
							"name": "Sandestin Golf and Beach Resort",
							"LatLon": "30.3855564,-86.39700070000004"
						},
					"City": "Destin",
					"State": "FL",
					"Trip start": "5/31/14",
					"Trip end": "6/7/14",
					"Court paid": " $3,782.18 "
				}
			]
	},
	{
		"name": "Laurie White",
		"trips":
			[
				{
					"Reason for trip": "Bench Bar CLE",
					"type": "car",
					"Venue": 
						{
							"name": "Beau Rivage Resort",
							"LatLon": "30.3925211,-88.8914355"
						},
					"City": "Biloxi",
					"State": "MS",
					"Trip start": "4/19/13",
					"Trip end": "4/21/13",
					"Court paid": " $337.01 "
				},
				{
					"Reason for trip": "Spring Judges Conference (LA Judicial College)",
					"type": "car",
					"Venue": 
						{
							"name": "Hilton Lafayette",
							"LatLon": "30.1961512,-92.01563820000001"
						},
					"City": "Lafayette",
					"State": "LA",
					"Trip start": "4/10/14",
					"Trip end": "4/11/14",
					"Court paid": " $336.64 "
				},
				{
					"Reason for trip": "Evidence Based Sentencing Western Workshop**",
					"type": "plane",
					"Venue": 
						{
							"name": "Sheraton Phoenix Downtown",
							"LatLon": "33.452697,-112.070585"
						},
					"City": "Phoenix",
					"State": "AZ",
					"Trip start": "4/15/14",
					"Trip end": "4/16/14",
					"Court paid": ""
				},
				{
					"Reason for trip": "American Correctional Association awards ceremony",
					"type": "plane",
					"Venue": 
						{
							"name": "",
							"LatLon": "29.817178,-95.4012915"
						},
					"City": "Houston",
					"State": "TX",
					"Trip start": "1/27/13",
					"Trip end": "1/29/13",
					"Court paid": " $118.00 "
				}
			]
	},
	{
		"name": "Benedict Willard",
		"trips":
			[
				{
					"Reason for trip": "Joint Summer School/LSBA Annual Meeting",
					"type": "car",
					"Venue": 
						{
							"name": "Sandestin Golf and Beach Resort",
							"LatLon": "30.3855564,-86.39700070000004"
						},
					"City": "Destin",
					"State": "FL",
					"Trip start": "6/2/13",
					"Trip end": "6/7/13",
					"Court paid": " $2,976.03 "
				}
			]
	},
	{
		"name": "Franz Zibilich",
		"trips":
			[
				{
					"Reason for trip": "Spring Judges Conference (LA Judicial College)",
					"type": "car",
					"Venue": 
						{
							"name": "Hilton Lafayette",
							"LatLon": "30.1961512,-92.01563820000001"
						},
					"City": "Lafayette",
					"State": "LA",
					"Trip start": "4/9/14",
					"Trip end": "4/11/14",
					"Court paid": " $1,149.64 "
				},
				{
					"Reason for trip": "Joint Summer School/LSBA Annual Meeting",
					"type": "car",
					"Venue": 
						{
							"name": "Sandestin Golf and Beach Resort",
							"LatLon": "30.3855564,-86.39700070000004"
						},
					"City": "Destin",
					"State": "FL",
					"Trip start": "6/2/13",
					"Trip end": "6/6/13",
					"Court paid": " $2,326.90 "
				}
			]
	}
];