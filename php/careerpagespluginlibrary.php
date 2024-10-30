<?php
// careerpagespluginlibrary.php must always be identical with careerpageslibrary.php in all locations
// It holds the same classname 'CareerpagesLibrary' and is called from various places
//
// The class 'CareerpagesLibrary' are located in following files and places:
// - plugin: trunk\php\careerpageslibrary.php
// - plugin: trunk\php\careerpagespluginlibrary.php
// - prodii: common\careerpages\php\careerpageslibrary.php
// - prodii: common\careerpages\plugin\php\careerpagespluginlibrary.php

class CareerpagesLibrary {

	// Do not change the initiate function
	public static function initiateLocale() {
		global $templateini;

		//$templateimages = self::getImages();
		
		clearstatcache();
		if (true === function_exists('gettext')) {
			$setlocale1 = setlocale(LC_ALL, "0");
			$locale = setlocale(LC_ALL, str_replace("_", "-", $templateini["locale"]), str_replace("-", "_", $templateini["locale"]), 'en-GB'); //self::fitLocaletoserver($templateini["locale"]);
			$putenv = putenv("LANG=".$locale); 
			$setlocale = setlocale(LC_ALL, $locale);
			$domain = $templateini["template"].'-'.str_replace("-", "_", $templateini["locale"]);
			$localesurl = str_replace('\\', '/', $_SERVER['DOCUMENT_ROOT'].'/common/careerpages/templates/'.$templateini["template"].'/locales');
			$bindtextdomain = bindtextdomain($domain, str_replace('\\', '/', $_SERVER['DOCUMENT_ROOT'].'/common/careerpages/templates/'.$templateini["template"].'/locales'));
			$bind_textdomain_codeset = bind_textdomain_codeset($domain, 'utf8');
			$textdomain = textdomain($domain);
			$setlocale2 = setlocale(LC_ALL, "0");
		} else {
			$templateini["infogui"] = "<br>You do not have the gettext library installed with PHP.<br><br>";
		}
	}

	public static function testEmail($email) {
		$output = true; 
		if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
			$output = false; 
		}
		
		return $output;
	}

	public static function extractVanityurl($vanityurl, $baseurl) {
		$urlArr = explode($baseurl, $vanityurl);
		$vanityurl = $urlArr[count($urlArr) - 1];
		
		return $vanityurl;
	}
	
	public static function getStaticmap($latitude, $longitude, $zoom, $w, $h, $marker) {
		return '//maps.googleapis.com/maps/api/staticmap?center='.$latitude.','.$longitude.'&zoom='.$zoom.'&size='.$w.'x'.$h.'&maptype=roadmap&markers=color:'.$marker.'%7Ccolor:'.$marker.'%7C'.$latitude.','.$longitude;
	}

	public static function isSecure() {
		$isSecure = false;
		if (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] == 'on') {
				$isSecure = true;
		} elseif (!empty($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] == 'https' || !empty($_SERVER['HTTP_X_FORWARDED_SSL']) && $_SERVER['HTTP_X_FORWARDED_SSL'] == 'on') {
				$isSecure = true;
		}

		return $isSecure;
	}

	public static function get_client_ip() {
		if (!empty($_SERVER['HTTP_CLIENT_IP'])) { // check ip from share internet
			$ip = $_SERVER['HTTP_CLIENT_IP'];
		} elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) { // to check if ip is pass from proxy
			$ip = $_SERVER['HTTP_X_FORWARDED_FOR'];
		} else {
			$ip = $_SERVER['REMOTE_ADDR'];
		}
		return $ip;
	}
	
	public static function randomString($length) {
		$chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";	

		$str = "";
		$size = strlen($chars);
		for($i = 0; $i < $length; $i++) {
			$str .= $chars[rand(0, $size - 1)];
		}

		return $str;
	}
	
	public static function randomStringLowercase($length) {
		$chars = "abcdefghijklmnopqrstuvwxyz";	

		$str = "";
		$size = strlen($chars);
		for($i = 0; $i < $length; $i++) {
			$str .= $chars[rand(0, $size - 1)];
		}

		return $str;
	}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////                                //////////////////////////////////////////////////////////////////////////////////////////
/////////////       Geo time functions       //////////////////////////////////////////////////////////////////////////////////////////
/////////////                                //////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	public static function getTime($date, $timezoneid) {
		$timeUTC = array();
		if ($date && $timezoneid) {
			$dateObj = new DateTime("@$date");
			/*if ($timezoneid) {*/ $dateObj->setTimezone(new DateTimeZone($timezoneid)); //}
			$timeUTC["date"] = $dateObj->format("j. M. Y");
			$timeUTC["shortdate"] = $dateObj->format("M. Y");
			$timeUTC["year"] = $dateObj->format("Y");
			$timeUTC["time"] = $dateObj->format("h:i a");
			$timeUTC["exacttime"] = $dateObj->format("H:i:s");
			$timeUTC["offset"] = $dateObj->format("P");
			$timeUTC["unix"] = $dateObj->format("U");
			$timeUTC["test"] = time($date);
			$timeUTC["twitter"] = $dateObj->format("j M");
		} else {
			$timeUTC["date"] = "";
			$timeUTC["shortdate"] = "";
			$timeUTC["year"] = "";
			$timeUTC["time"] = "";
			$timeUTC["exacttime"] = "";
			$timeUTC["offset"] = "";
			$timeUTC["unix"] = "";
			$timeUTC["test"] = "";
			$timeUTC["twitter"] = "";
		}
		
		return $timeUTC;
	}
	
	public static function getDiffTime($startdate, $enddate) {
		$diff = array();
 		if ($startdate && $enddate) {
			$diffStart = new DateTime("@$startdate");
			$diffEnd = new DateTime("@$enddate");
			$diffDate = date_diff($diffStart, $diffEnd);
			$diffYears = $diffDate->format("%y");
			$diffMonths = $diffDate->format("%m");
			$diffDays = $diffDate->format("%d");
			$diff["year"] = $diffYears.($diffYears > 1 ? " years" : " year");
			$diff["intyear"] = $diffYears;
			$diff["yearmonth"] = ($diffYears == "0" ? "" : ($diffYears == "1" ? $diffYears." year " : $diffYears." years ")).$diffMonths.($diffMonths == 1 ? " month" : " months");
			$diff["yearmonthshort"] = ($diffYears == "0" ? "" : ($diffYears == "1" ? $diffYears." yrs " : $diffYears." yrs ")).$diffMonths.($diffMonths == 1 ? " mth" : " mth");
			$diff["yearmonthday"] = ($diffYears == "0" ? "" : ($diffYears == "1" ? $diffYears." year " : $diffYears." years ")).($diffMonths == "0" ? "" : ($diffMonths == "1" ? $diffMonths." month " : $diffMonths." months ")).($diffDays == "0" ? "0 days" : ($diffDays == "1" ? $diffDays." day " : $diffDays." days"));
		} else {
			$diff["year"] = "";
			$diff["intyear"] = null;
			$diff["yearmonth"] = "";
			$diff["yearmonthshort"] = "";
			$diff["yearmonthday"] = "";
		}
		
		return $diff;
	}

	public static function getFormattedaddress($addresscomponents) {
		$formattedaddress = array();

		$formattedaddress["CO"] = null;
		$formattedaddress["CI, CO"] = null;
		$formattedaddress["ST-NU"] = null;
		$formattedaddress["PO-CI"] = null;
		$formattedaddress["ST, CI, CO"] = null;
		$formattedaddress["ST-NU, CI, CO"] = null;
		$formattedaddress["ST, CI, AL3, AL2, AL1"] = null;
		$formattedaddress["ST, CI, AL3, AL2, AL1, CO"] = null;
		$formattedaddress["ST-NU, CI, AL3, AL2, AL1, CO"] = null;

		if ($addresscomponents) {
			$addresscomponents = json_decode($addresscomponents, true);
			$adressArray = self::getAddressFromAddresscomponents($addresscomponents);

			$streetnumberArr = array();
			if(isset($adressArray["street"]["long"]) && $adressArray["street"]["long"]) $streetnumberArr[] = $adressArray["street"]["long"];
			if(isset($adressArray["number"]["long"]) && $adressArray["number"]["long"]) $streetnumberArr[] = $adressArray["number"]["long"];
			$streetnumber = implode(" ", $streetnumberArr);
			
			$zipcityArr = array();
			if(isset($adressArray["zipcode"]["long"]) && $adressArray["zipcode"]["long"]) $zipcityArr[] = $adressArray["zipcode"]["long"];
			if(isset($adressArray["city"]["long"]) && $adressArray["city"]["long"]) $zipcityArr[] = $adressArray["city"]["long"];
			$zipcity = implode(" ", $zipcityArr);

			if ($adressArray) {
				// CO (country)
				$addressArr = array();
				if(isset($adressArray["country"]["long"]) && $adressArray["country"]["long"]) $addressArr[] = $adressArray["country"]["long"];
				$formattedaddress["CO"] = implode(", ", $addressArr);
				// CI, CO (city, country)
				$addressArr = array();
				if(isset($adressArray["city"]["long"]) && $adressArray["city"]["long"]) $addressArr[] = $adressArray["city"]["long"];
				if(isset($adressArray["country"]["long"]) && $adressArray["country"]["long"]) $addressArr[] = $adressArray["country"]["long"];
				$formattedaddress["CI, CO"] = implode(", ", $addressArr);
				// ST-NU (street, number)
				$addressArr = array();
				if ($streetnumber) $addressArr[] = $streetnumber;
				$formattedaddress["ST-NU"] = implode(" ", $addressArr);
				// PO-CI (zip, city)
				$addressArr = array();
				if(isset($adressArray["zipcode"]["long"]) && $adressArray["zipcode"]["long"]) $addressArr[] = $adressArray["zipcode"]["long"];
				if(isset($adressArray["city"]["long"]) && $adressArray["city"]["long"]) $addressArr[] = $adressArray["city"]["long"];
				$formattedaddress["PO-CI"] = implode(" ", $addressArr);
				// ST, CI, CO (street, city, country)
				$addressArr = array();
				if(isset($adressArray["street"]["long"]) && $adressArray["street"]["long"]) $addressArr[] = $adressArray["street"]["long"];
				if(isset($adressArray["city"]["long"]) && $adressArray["city"]["long"]) $addressArr[] = $adressArray["city"]["long"];
				if(isset($adressArray["country"]["long"]) && $adressArray["country"]["long"]) $addressArr[] = $adressArray["country"]["long"];
				$formattedaddress["ST, CI, CO"] = implode(", ", $addressArr);
				// ST-NU, CI, CO (street-number, city, country)
				$addressArr = array();
				if ($streetnumber) $addressArr[] = $streetnumber;
				if(isset($adressArray["city"]["long"]) && $adressArray["city"]["long"]) $addressArr[] = $adressArray["city"]["long"];
				if(isset($adressArray["country"]["long"]) && $adressArray["country"]["long"]) $addressArr[] = $adressArray["country"]["long"];
				$formattedaddress["ST-NU, CI, CO"] = implode(", ", $addressArr);
				// ST-NU, PO-CI (street-number, zip-city)
				$addressArr = array();
				if ($streetnumber) $addressArr[] = $streetnumber;
				if ($zipcity) $addressArr[] = $zipcity;
				$formattedaddress["ST-NU, PO-CI"] = implode(", ", $addressArr);
				// ST, CI, AL3, AL2, AL1, CO (street, city, al3, al2, al1, country)
				$addressArr = array();
				if(isset($adressArray["street"]["long"]) && $adressArray["street"]["long"]) $addressArr[] = $adressArray["street"]["long"];
				if(isset($adressArray["city"]["long"]) && $adressArray["city"]["long"]) $addressArr[] = $adressArray["city"]["long"];
				if(isset($adressArray["al3"]["long"]) && $adressArray["al3"]["long"]) $addressArr[] = $adressArray["al3"]["long"];
				if(isset($adressArray["al2"]["long"]) && $adressArray["al2"]["long"]) $addressArr[] = $adressArray["al2"]["long"];
				if(isset($adressArray["al1"]["long"]) && $adressArray["al1"]["long"]) $addressArr[] = $adressArray["al1"]["long"];
				if(isset($adressArray["country"]["long"]) && $adressArray["country"]["long"]) $addressArr[] = $adressArray["country"]["long"];
				$formattedaddress["ST, CI, AL3, AL2, AL1, CO"] = implode(", ", $addressArr);
				// ST-NU, CI, AL3, AL2, AL1, CO (street, city, al3, al2, al1, country)
				$addressArr = array();
				if ($streetnumber) $addressArr[] = $streetnumber;
				if(isset($adressArray["city"]["long"]) && $adressArray["city"]["long"]) $addressArr[] = $adressArray["city"]["long"];
				if(isset($adressArray["al3"]["long"]) && $adressArray["al3"]["long"]) $addressArr[] = $adressArray["al3"]["long"];
				if(isset($adressArray["al2"]["long"]) && $adressArray["al2"]["long"]) $addressArr[] = $adressArray["al2"]["long"];
				if(isset($adressArray["al1"]["long"]) && $adressArray["al1"]["long"]) $addressArr[] = $adressArray["al1"]["long"];
				if(isset($adressArray["country"]["long"]) && $adressArray["country"]["long"]) $addressArr[] = $adressArray["country"]["long"];
				$formattedaddress["ST-NU, CI, AL3, AL2, AL1, CO"] = implode(", ", $addressArr);
			}
		}
		
		return $formattedaddress;
	}
	
	public static function getAddressFromAddresscomponents($addresscomponents) {
		$typesAccepted = array("street_number" => "number", "route" => "street", "neighborhood" => "area", "locality" => "city", "administrative_area_level_3" => "al3", "administrative_area_level_1" => "al2", "administrative_area_level_1" => "al1", "country" => "country", "postal_code_prefix" => "zipcode");
		
		$address = array();

		if (is_array($addresscomponents)) {
			foreach($addresscomponents as $component) {
				foreach($component["types"] as $type) {
					if (array_key_exists ($type, $typesAccepted)) {
						$longshort = array();
						$longshort["long"] = $component["long_name"];
						$longshort["short"] = $component["short_name"];
						$address[$typesAccepted[$type]] = $longshort;
						break;
					}
				}
			}
		}

		return $address;
	}

	public static function getImageurl($image) {
		global $templateini;
		
		if ($image["url"]) {
			if($templateini["local"]) {
				$url = $templateini["templateurl"].'images/'.$image["url"];
			} else {
				$url = self::getSiteUrl().'/common/careerpages/templates/'.$templateini["template"].'/images/'.$image["url"];
			}
		}
		
		return $url;
	}

	public static function getProfileimageurl($templateimages, $image) {
		global $templateini;
		
		if ($image["url"]) {
			if($image["mediasid"]) {
				$url = $image["url"];
			} else {
				$url = self::getProdiiUrl().'/common/uploadimages/'.$image["url"];
			}
		} else {
			if($templateini["local"]) {
				$url = $templateini["templateurl"].'images/'.$templateimages["profile_image_placeholder"];
			} else {
				$url = self::getSiteUrl().'/common/careerpages/templates/'.$templateini["template"].'/images/'.$templateimages["profile_image_placeholder"];
			}
		}
		
		return $url;
	}

	public static function getTeamimageurl($templateimages, $image) {
		global $templateini;

		if ($image["url"]) {
			$url = self::getProdiiUrl().'/common/uploadimages/'.$image["url"];
		} else {
			if($templateini["local"]) {
				$url = $templateini["templateurl"].'images/'.$templateimages["team_image_placeholder"];
			} else {
				$url = self::getSiteUrl().'/common/careerpages/templates/'.$templateini["template"].'/images/'.$templateimages["team_image_placeholder"];
			}
		}
		
		return $url;
	}

	public static function getCompanyimageurl($templateimages, $image) {
		global $templateini;

		if ($image["url"]) {
			$url = self::getProdiiUrl().'/common/uploadimages/'.$image["url"];
		} else {
			if($templateini["local"]) {
				$url = $templateini["templateurl"].'images/'.$templateimages["company_image_placeholder"];
			} else {
				$url = self::getSiteUrl().'/common/careerpages/templates/'.$templateini["template"].'/images/'.$templateimages["company_image_placeholder"];
			}
		}
		
		return $url;
	}
	
	public static function getSiteUrl() {
		$s = empty($_SERVER["HTTPS"]) ? '' : ($_SERVER["HTTPS"] == "on") ? "s" : "";
		$protocol = substr(strtolower($_SERVER["SERVER_PROTOCOL"]), 0, strpos(strtolower($_SERVER["SERVER_PROTOCOL"]), "/")) . $s;
		$port = ($_SERVER["SERVER_PORT"] == "80") ? "" : (":".$_SERVER["SERVER_PORT"]);
		$uri = $protocol . "://" . $_SERVER['SERVER_NAME']; // . $port;

		return $uri;
	}
	
	public static function getProdiiUrl() {
		global $templateini;

		if(strpos($_SERVER["SERVER_NAME"], '.local') == true) {
			$uri = 'http://prodii.local';
		} else {
			$uri = ($templateini["subdir"] ? 'https://'.$templateini["subdir"].'.' : 'https://').'prodii.com';
		}

		return $uri;
	}
}
?>