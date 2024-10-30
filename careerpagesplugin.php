<?php

/**
 * @package careerpages
 */
/*
Plugin Name: People profiles, team- and company pages
Plugin URI: https://prodii.com/WpPluginInfo
Description: With the Prodii WP-plugin, you can create a profile section on your wordpress homepage showcasing your professional accomplishments. On https://prodii.com  you build professional profiles (web pages) by collecting data about your work life. The Prodii plugin integrates information from your prodii account into your wordpress homepage.

Version: 5.1.0
Author: Prodii by Ralph Rezende Larsen
Author URI: https://prodii.com/view/ralphrezendelarsen
License:
*/

if (!class_exists("CareerpagesMain")) {
	class CareerpagesMain {
		public static $templateini;

		function __construct() {
			include(plugin_dir_path(__FILE__).'php/careerpagespluginlibrary.php');

		}
		
		function webItemExists($url) {
			$response = wp_remote_head($url, array());
			$accepted_status_codes = array(200, 301, 302);
			if (!is_wp_error($response) && in_array(wp_remote_retrieve_response_code($response), $accepted_status_codes)) {
				return array("file" => $url, "status" => true);
			}
			return array("file" => $url, "status" => false);
		}
		
		function getTemplatedata() {
			if (empty(self::$templateini["errors"])) {
				self::$templateini["templatedata"]["php"] = CareerpagesMain::webItemExists(plugins_url('templates/'.self::$templateini["template"].'/php/careerpagestemplate.php' , __FILE__ ), array());
				self::$templateini["pluginurl"] = plugins_url('', __FILE__).'/';
				self::$templateini["pluginpath"] = plugin_dir_path(__FILE__);
				if (self::$templateini["templatedata"]["php"]["status"]) {
					self::$templateini["local"] = 1;
					self::$templateini["templateurl"] = plugins_url('templates/'.self::$templateini["urlencodedtemplate"].'/' , __FILE__ );
					self::$templateini["templatepath"] = plugin_dir_path(__FILE__).'templates/'.self::$templateini["template"].'/';
				} else {
					$file_headers = @get_headers('https://'.(self::$templateini["subdir"] ? self::$templateini["subdir"].'.' : '') .'prodii.com/common/careerpages/templates/'.self::$templateini["template"].'/php/careerpagestemplate.php');
					self::$templateini["remote"]["status"] = strrpos($file_headers[0], ' 404 Not Found') === false;
					if (self::$templateini["remote"]["status"]) {
						self::$templateini["local"] = 0;
						self::$templateini["templateurl"] = self::$templateini["prodiiurl"].'/common/careerpages/templates/'.self::$templateini["urlencodedtemplate"].'/';
						self::$templateini["templatepath"] = '';
					} else {
						self::$templateini["errors"][] = 'We cannot find the template you are asking for. The '.self::$templateini["template"].' template is not locally in your presentation plugin nor on the Prodii server.';
					}
				}
			}

			if (empty(self::$templateini["errors"])) {
				// Get template ini
				if (self::$templateini["local"]) {
					require_once(self::$templateini["templatepath"].'php/careerpagestemplate.php');
					self::$templateini["ini"] = CareerpagesTemplate::getIni();
				} else {
					$request = new WP_Http;
					$httpUrl = self::$templateini["prodiiurl"].'/common/careerpages/php/careerpageshandler.php'; 
					$httpResult = $request->request( $httpUrl, array( 
						'method' => 'POST', 
						'body' => 	array(
										'action' => 'getIni',
										'key' => self::$templateini["key"],
										'template' => self::$templateini["template"]
									),
						'sslverify' => false
					));
					$httpResponse = null;
					$httpErrors = null;
					if(is_wp_error($httpResult)) {
						$httpErrors = $httpResult->get_error_messages();
					} else {
						$httpResponse = json_decode($httpResult["body"], true);
						self::$templateini["ini"] = $httpResponse;
					}

					if(is_wp_error($httpResult)) {
						foreach ($httpErrors as $error) {
							self::$templateini["errors"][] = 'Get template initialisation error - '.$error;
						}
					} elseif (self::$templateini["ini"] == '') {
						self::$templateini["errors"][] = 'No template initialisation returned';
					} elseif (isset($httpResponse["error"])) {
						self::$templateini["errors"][] = $httpResponse["error"];
					}
				}
			}

			if (empty(self::$templateini["errors"])) {
				//Get data(Template on local server) or html(Template on Prodii server)
				$request = new WP_Http;
				// Example of url to call to test: http://prodii.local/common/careerpages/php/careerpageshandler.php?action=getTeamData&key=WjEK4UWFcApDLsFR&team=56&template=dublin&locale=en_GB&local=1
				$httpUrl = self::$templateini["prodiiurl"].'/common/careerpages/php/careerpageshandler.php'; 
				$httpResult = $request->request( $httpUrl, array( 
					'method' => 'POST', 
					'body' => 	array(
									'action' => 'get'.self::$templateini["level"].(self::$templateini["local"] ? 'Data' : 'Html'),
									'key' => self::$templateini["key"],
									strtolower(self::$templateini["level"]) => self::$templateini["ids"],
									'template' => self::$templateini["template"],
									'locale' => self::$templateini["locale"],
									'local' => self::$templateini["local"],
									'subdir' => self::$templateini["subdir"],
									'css' => isset($css) && $css ? $css : '',
									'googlemapkey' => self::$templateini["googlemapkey"]
								),
					'sslverify' => false
				));

				$httpResponse = null;
				$httpErrors = null;

				if(is_wp_error($httpResult)) {
					$httpErrors = $httpResult->get_error_messages();
				} else {
					$httpResponse = json_decode($httpResult["body"], true);
					if (json_last_error()) {
						$httpResponse = $httpResult["body"];
					}
				}

				if(is_wp_error($httpResult)) {
					foreach ($httpErrors as $error) {
						self::$templateini["errors"][] = 'Get '.(self::$templateini["local"] ? 'data' : 'html').' error - '.$error;
					}
				} elseif ($httpResponse == '') {
					self::$templateini["errors"][] = 'No '.(self::$templateini["local"] ? 'data' : 'html').' returned';
				} elseif (isset($httpResponse["error"])) {
					self::$templateini["errors"][] = $httpResponse["error"];
				} elseif (isset($httpResponse["error_message"])) {
					self::$templateini["errors"] = array_merge(self::$templateini["errors"], $httpResponse["error_message"]);
				}
			}

			if (empty(self::$templateini["errors"])) {
				//Set server data
				$request = new WP_Http;
				$httpUrl = self::$templateini["prodiiurl"].'/common/careerpages/php/careerpageshandler.php'; 
				$httpResult = $request->request( $httpUrl, array( 
					'method' => 'POST', 
					'body' => 	array(
						'action' => 'setLogistics',
						'level' => self::$templateini["level"],
						'ids' => self::$templateini["ids"],
						'method' => 'wpplugin',
						'template' => self::$templateini["template"],
						'locale' => str_replace("-", "_", self::$templateini["locale"]),
						'key' => self::$templateini["key"],
						'clientip' => CareerpagesLibrary::get_client_ip(),
						'server' => json_encode($_SERVER)
					),
					'sslverify' => false
				));

				if(is_wp_error($httpResult)) {
					$httpErrors = $httpResult->get_error_messages();

					foreach ($httpErrors as $error) {
						//self::$templateini["errors"][] = 'Get '.(self::$templateini["local"] ? 'data' : 'html').' error - '.$error;
						// There is no reason to show this error to the user
					}
				}
			}
			
			if (empty(self::$templateini["errors"])) {
				if (self::$templateini["local"]) {
					global $templateini;
					$templateini = self::$templateini;
					
					global $skilllevels;
					if (isset($httpResponse['skilllevels'])) $skilllevels = $httpResponse['skilllevels'];
					
					global $languagelevels;
					if (isset($httpResponse['languagelevels'])) $languagelevels = $httpResponse['languagelevels'];

					switch (self::$templateini["level"]) {
						case "Company":
							self::$templateini["gui"] = CareerpagesTemplate::getCompany($httpResponse);
							break;
						case "Network":
							self::$templateini["gui"] = CareerpagesTemplate::getCompany($httpResponse);
							break;
						case "Team":
							self::$templateini["gui"] = CareerpagesTemplate::getTeam($httpResponse);
							break;
						case "Profile":
							self::$templateini["gui"] = CareerpagesTemplate::getProfile($httpResponse);
							break;
					}						
				} else {
					self::$templateini["gui"] = $httpResponse;
				}
			}
		}
		
		function conditionally_add_scripts_and_styles($posts, $wp_query){
			if ($wp_query->is_main_query()) {
				self::$templateini = array();
				self::$templateini["errors"] = array();

				$error = array();
				
				if (empty($posts)) return $posts;

				$shortcode_found = false;
				$content = '';
				foreach ($posts as $post) {
					if (stripos($post->post_content, '[careerpages ') !== false) {
						if ($post->post_type == 'page') {
							$shortcode_found = true;
							$content = $post->post_content;
							break;
						} else {
							$post->post_content = 'Sorry but Career pages only works with pages';
						}
					}
				}
				
				if ($shortcode_found) {
					// Key
					if (stripos($content, ' key="') !== false) {
						$startpos = stripos($content, ' key="') + 6;
						self::$templateini["key"] = substr($content, $startpos, stripos($content, '"', $startpos) - $startpos);
					} else {
						self::$templateini["errors"][] = 'Key missing or Key is misspelled in shortcode';
					}
					
					// Subdir
					$subdir = '';
					if (stripos($content, ' subdir="') !== false) {
						$startpos = stripos($content, ' subdir="') + 9;
						self::$templateini["subdir"] = substr($content, $startpos, stripos($content, '"', $startpos) - $startpos);
					} else {
						self::$templateini["subdir"] = '';
					}
					
					if(strpos($_SERVER["SERVER_NAME"], '.local') === true) {
						self::$templateini["prodiiurl"] = 'http://prodii.local';
					} else {
						self::$templateini["prodiiurl"] = (self::$templateini["subdir"] ? 'https://'.self::$templateini["subdir"].'.' : 'https://').'prodii.com';
					}
			
					// Get permissions
					$request = new WP_Http;
					$httpUrl = self::$templateini["prodiiurl"].'/common/careerpages/php/careerpageshandler.php';
					$httpResult = $request->request( $httpUrl, array( 
						'method' => 'POST', 
						'body' => 	array(
										'action' => 'getPermissions',
										'key' => self::$templateini["key"]
									),
						'sslverify' => false
					));
					
					$httpResponse = null;
					$httpErrors = null;
					if(is_wp_error($httpResult)) {
						$httpErrors = $httpResult->get_error_messages();
					} else {
						$httpResponse = json_decode($httpResult["body"], true);
					}

					if(is_wp_error($httpResult)) {
						foreach ($httpErrors as $error) {
							self::$templateini["errors"][] = 'Permission error - '.$error;
						}
					} elseif ($httpResponse == '') {
						self::$templateini["errors"][] = 'No permissions, the key in the shortcode must be missspelled or wrong';
					} elseif (isset($httpResponse["error"])) {
						//self::$templateini["errors"] = array_merge(self::$templateini["errors"], $httpResponse["error"]);
						self::$templateini["errors"][] = $httpResponse["error"];
					}
					
					$permissions = $httpResponse;
					
					// Template
					//if (isset($permissions["premium"]) && $permissions["premium"] && stripos($content, ' template="') !== false) {
					if (stripos($content, ' template="') !== false) {
						$startpos = stripos($content, ' template="') + 11;
						self::$templateini["template"] = substr($content, $startpos, stripos($content, '"', $startpos) - $startpos);
						self::$templateini["urlencodedtemplate"] = rawurlencode(substr($content, $startpos, stripos($content, '"', $startpos) - $startpos));
					} else {
						self::$templateini["template"]= isset($permissions["defaulttemplate"]) ? $permissions["defaulttemplate"] : 'copenhagen';
						self::$templateini["urlencodedtemplate"]= isset($permissions["defaulttemplate"]) ? rawurlencode($permissions["defaulttemplate"]) : rawurlencode('copenhagen');
					}

					// Locale
					//if (isset($permissions["locales"]) && $permissions["locales"] && stripos($content, ' locale="') !== false) {
					if (stripos($content, ' locale="') !== false) {
						$startpos = stripos($content, ' locale="') + 9;
						self::$templateini["locale"] = substr($content, $startpos, stripos($content, '"', $startpos) - $startpos);
						self::$templateini["urlencodedlocale"] = rawurlencode(substr($content, $startpos, stripos($content, '"', $startpos) - $startpos));
					} else {
						self::$templateini["locale"]= isset($permissions["defaultlocale"]) ? $permissions["defaultlocale"] : 'en_GB';
						self::$templateini["urlencodedlocale"]= isset($permissions["defaultlocale"]) ? rawurlencode($permissions["defaultlocale"]) : rawurlencode('en_GB');
					}
					
					// Css
					if (stripos($content, ' css="') !== false) {
						$startpos = stripos($content, ' css="') + 6;
						self::$templateini["css"] = substr($content, $startpos, stripos($content, '"', $startpos) - $startpos);
					} else {
						self::$templateini["css"] = '';
					}

					// Level
					if (stripos($content, ' level="') !== false) {
						$startpos = stripos($content, ' level="') + 8;
						self::$templateini["level"] = substr($content, $startpos, stripos($content, '"', $startpos) - $startpos);
					} else {
						self::$templateini["errors"][] = 'Level missing or Level is misspelled in shortcode';
					}
					
					// Ids
					if (stripos($content, ' ids="') !== false) {
						$startpos = stripos($content, ' ids="') + 6;
						self::$templateini["ids"] = substr($content, $startpos, stripos($content, '"', $startpos) - $startpos);
					} else {
						self::$templateini["errors"][] = 'Ids missing or Ids is misspelled in shortcode';
					}
					
					// googlemapkey
					self::$templateini["googlemapkey"] = get_option("googlemap_key");

					CareerpagesMain::getTemplatedata();
					if (empty(self::$templateini["errors"])) {
						foreach (self::$templateini["ini"]["styles"] as $name => $url) {
							wp_register_style($name, self::$templateini["templateurl"].$url);
						}
						foreach (self::$templateini["ini"]["scripts"] as $name => $url) {
							wp_register_script($name, self::$templateini["templateurl"].$url);
						}
					}

					// plugin specific files from plugin, IE10 viewport hack for Surface/desktop Windows 8 bug
					wp_register_script('careerpages_viewportbug', plugins_url('js/ie10-viewport-bug-workaround.js' , __FILE__ ));

					wp_register_script('careerpages_googlemap_places', 'https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=places&amp;language=en'.(isset(self::$templateini["googlemapkey"]) && self::$templateini["googlemapkey"] ? '&key='.self::$templateini["googlemapkey"] : ''), false, '3');
					wp_register_script('careerpages_script', plugins_url('js/careerpages.js' , __FILE__ ));
					wp_register_script('careerpages_library', plugins_url('js/library.js' , __FILE__ ));
				}
			}
			
			return $posts;
		}
		
		function addHeaderCode() {
			if (empty(self::$templateini["errors"])) {
				if (function_exists('wp_enqueue_script')) {
					echo '<meta http-equiv="X-UA-Compatible" content="IE=edge">';
					echo '<meta name="viewport" content="width=device-width, initial-scale=1">';

					// plugin specific files from plugin, IE10 viewport hack for Surface/desktop Windows 8 bug
					wp_enqueue_script('careerpages_viewportbug');

					echo	'
								<!--[if lt IE 9]>
									<script type="text/javascript" src="'.plugins_url('js/html5shiv.js' , __FILE__ ).'"></script>
									<script type="text/javascript" src="'.plugins_url('js/respond.min.js' , __FILE__ ).'"></script>
								<![endif]-->
								';
					
					wp_enqueue_script('jquery');
					if (!empty(self::$templateini["ini"]["styles"])) {
						foreach (self::$templateini["ini"]["styles"] as $name => $url) {
							wp_enqueue_style($name);
						}
					}
					if (!empty(self::$templateini["ini"]["scripts"])) {
						foreach (self::$templateini["ini"]["scripts"] as $name => $url) {
							wp_enqueue_script($name);
						}
					}
					wp_enqueue_script('careerpages_script');
					wp_enqueue_script('careerpages_library');
					wp_enqueue_script('careerpages_googlemap_places'); // Removed resently
				}
			}
		}

		function addContent($content = '') {
		}

		static function getErrorGui($header, $content) {
			$gui = 	'
					<div style="padding:20px 20px 0 20px;">
						<table style="margin:0;padding:0;background-color:transparent;">
							<tr>
								<td style="background-color:transparent;">
									<i class="fa fa-warning fa-2x" aria-hidden="true" style="color:#f0ad4e;"></i>
								</td>
								<td id=errTarget style="background-color:transparent;">
									<div style="font-size: 36px;line-height: 36px;margin-bottom: 10px;">Sorry for the inconvenience</div>
									<strong>'.$header.'</strong>
									<br>
									'.$content.'
								</td>
							</tr>
						</table>
					</div>
					';
			
			return $gui;
		}
		
		static function careerpages_shortcut($atts) {
			if (isset(self::$templateini["gui"]) && is_array(self::$templateini["gui"]) && isset(self::$templateini["gui"]["error"])) {
				switch (self::$templateini["gui"]["error"]) {
					case 'There is no handler for getTeamsHtml':
						$gui = 	'
								<strong>Problem:</strong> You have updated the <b>People profiles, team- and network pages</b>-plugin recently and need to change the shortcode level parameter.<br>
								<strong>How to fix it:</strong> Please change the parameter from level="Teams" to level="Network", in order use Prodii\'s latest version of the <b>People profiles, team- and network pages</b>-plugin.
								<br><br>
								<b>NB:</b> Don\'t forget to add network id before the the team id\'s in the shortcode ids parameter.
								<br><br>
								Go to <a href="'.admin_url().'admin.php?page=prodii-shortcode" target="_blank">wp-admin - Prodii - Shortcodes</a>, generate your shortcode, and paste it on the page.
								';
						$content = CareerpagesMain::getErrorGui('New plugin release', $gui);
						break;
					default:
						$gui = 	self::$templateini["gui"]["error"];
						$content = CareerpagesMain::getErrorGui('Following error was detected', $gui);
						break;
				}			
			} elseif (!empty(self::$templateini["errors"])) {
				$gui =	'	<ul style="margin-left:1.25em;margin-bottom: 0;">';
				foreach (self::$templateini["errors"] as $error) {
					$gui .=	'	<li>'.$error.'</li>';
				}
				$gui .= '	</ul>';
				$content = CareerpagesMain::getErrorGui('The following errors was detected from the server', $gui);			
			} else {
				$content = 	'
							<input id="handler" type="hidden" value="'.plugins_url('php/careerpagespluginhandler.php' , __FILE__ ).'"/>
							<input id="local" type="hidden" value="'.(isset(self::$templateini["local"]) ? self::$templateini["local"] : "").'"/>
							<input id="subdir" type="hidden" value="'.(isset($atts["subdir"]) && $atts["subdir"] ? $atts["subdir"] : "").'"/>
							<input id="template" type="hidden" value="'.$atts["template"].'"/>
							<input id="locale" type="hidden" value="'.(isset($atts["locale"]) && $atts["locale"] ? $atts["locale"] : 'en_GB').'"/>
							<input id="key" type="hidden" value="'.$atts["key"].'"/>
							<input id="companyids" type="hidden" value="'.($atts["level"] == "Company" || $atts["level"] == "Network" ? $atts["ids"] : "0").'"/>
							<input id="teamid" type="hidden" value="'.($atts["level"] == "Team" ? $atts["ids"] : "0").'"/>
							<input id="profileid" type="hidden" value="'.($atts["level"] == "Profile" ? $atts["ids"] : "0").'"/>
							'.(isset($atts["css"]) && $atts["css"] ? '<input id="css" type="hidden" value="'.$atts["css"].'"/>' : '<input id="css" type="hidden" value="careerpagestemplatedefault.css"/>').'
							<div id="careerpagescontent" class="prd-body">'.(isset(self::$templateini["gui"]) ? self::$templateini["gui"] : '').'</div>
							';
			}
			
			return $content;
		}
	}
}

if( !class_exists( 'WP_Http' ) )
    include_once( ABSPATH . WPINC. '/class-http.php' );

if (class_exists("CareerpagesMain")) {
	$careerpagesMain = new CareerpagesMain();
}

if (isset($careerpagesMain)) {
	// the_posts gets triggered before wp_head
	//add_filter('the_posts', array(&$careerpagesMain, 'conditionally_add_scripts_and_styles'), 1);
	add_filter('the_posts', array(&$careerpagesMain, 'conditionally_add_scripts_and_styles'), 10, 2);
	add_action('wp_enqueue_scripts', array(&$careerpagesMain, 'addHeaderCode'), 111115);
	add_shortcode('careerpages', array('careerpagesMain', 'careerpages_shortcut'));
}

////////////////////////////////////////////////////////////////////////////////////
//////////
//////////				Admin
//////////
////////////////////////////////////////////////////////////////////////////////////
if (!class_exists("ProdiiAdmin")) {
	class ProdiiAdmin {

		function __construct() { //constructor
			//require_once(self::$templateini["pluginpath"].'/php/careerpagespluginlibrary.php');
			//require_once(plugins_url('php/careerpagespluginlibrary.php' , __FILE__ ));
			//include(plugin_dir_path(__FILE__).'php/careerpagespluginlibrary.php');
		}

		function set_admin_statistics($page) {
			//Set server data
			$request = new WP_Http;
			$httpUrl = CareerpagesLibrary::getSiteUrl().'/common/careerpages/php/careerpagesadminhandler.php'; 
			$httpResult = $request->request( $httpUrl, array( 
				'method' => 'POST', 
				'body' => 	array(
								'action' => 'setLogistics',
								'key' => get_option("prodii_key"),
								'method' => 'wppluginadmin',
								'page' => $page,
								'clientip' => CareerpagesLibrary::get_client_ip(),
								'server' => json_encode($_SERVER)
							),
				'sslverify' => false
			));

			if(is_wp_error($httpResult)) {
				echo $httpResult->get_error_messages();
			} else {
				$httpResponse = json_decode($httpResult["body"], true);
			}
		}

		function addAdminHeaderCode($hook) {
			global $prodii_shortcode_page;
			
			//if ($hook != $prodii_shortcode_page) return;
			
			//wp_register_style('careerpages_admin_prettify_style', 'https://google-code-prettify.googlecode.com/svn/trunk/src/prettify.css');
			wp_register_style('careerpages_admin_prettify_style', plugins_url('css/prettify.css', __FILE__ ));
			wp_enqueue_style('careerpages_admin_prettify_style');
			
			wp_register_script('careerpages_admin_script', plugins_url('js/careerpagesadmin.js', __FILE__ ), array('jquery'));
			wp_enqueue_script('careerpages_admin_script');
			wp_localize_script('careerpages_admin_script', 'prodii_vars', array(
				'prodii_nonce' => wp_create_nonce('prodii_nonce')
			));
			//wp_enqueue_script('careerpages_admin_prettify_script', 'https://google-code-prettify.googlecode.com/svn/trunk/src/prettify.js', false, '3');
			wp_enqueue_script('careerpages_admin_prettify_script', plugins_url('js/prettify.js', __FILE__ ), false, '3');
		}

		//Prints out the admin Prodii description page
		function prodii_description_page() {
			self::set_admin_statistics('description');

			echo 	'
					<div class="wrap">
						<h2>Prodii Description</h2>
						<br>
						<p>If you find the this presentation plugin useful, please rate it <a target="_blank" href="http://wordpress.org/support/view/plugin-reviews/company-presentation#postform"> ★★★★★ </a>.</p>
						<br>
						<table class="form-table">
							<tr valign="top">
								<th scope="row">About Us Section</th>
								<td>
									<p>With the Prodii Plugin you can create an "About Us" section for people, teams and your network.</p>
									<p>From a simple employee directory listing of your employees and/ or co-workers to an extended profile information with photos, skills and bio - all put together in a stylish design.</p>
									<p>It can be used for "meet people who work at this location", "see who is member of our team", "meet your future collegues" etc.</p>
								</td>
							</tr>
							<tr valign="top">
								<th scope="row">HOW IT WORKS</th>
								<td>
									<p>&nbsp;</p>
								</td>
							</tr>
							<tr valign="top">
								<th scope="row">1. Sign Up on <a href="https://prodii.com" target="_blank">https://prodii.com</a></th>
								<td>
									<ol>
										<li>Go to <a href="https://prodii.com" target="_blank">https://prodii.com</a> and register for an account</li>
										<li>Create your network, your team(s) and invite your co-workers</li>
										<li>Go to your personal Account > Account Settings and Copy your Publisher Key (a combination og letters and numbers)
									</ol>
								</td>
							</tr>
							<tr valign="top">
								<th scope="row">Gather data</th>
								<td>
									<p>You can upgrade from a personal profile to a team owner. You build up your own virtual organisation by adding a network and then adding teams to the network. First you enter information about your network and team. Then you invite people to your team(s). Team members enter information about themselves. While doing so they share their data with you as the host of the teams and the manager of the data hub.</p>
								</td>
							</tr>
							<tr valign="top">
								<th scope="row">2. Go to your wordpress homepage</th>
								<td>
									<p>&nbsp;</p>
								</td>
							</tr>
							<tr valign="top">
								<th scope="row">Activate your Publisher Key under Settings</th>
								<td>
									<p>Choose Settings and paste your publisher key then Save.<br>&nbsp;</p>
								</td>
							</tr>
							<tr valign="top">
								<th scope="row">Generate your short code</th>
								<td>
									<p>Prodii puts all the content and data together for you in a short code looking like this:</p>
									<p><span class="pun">[</span><span class="pln">careerpages</span> <span class="kwd">key</span><span class="pun">=</span><span class="str">"WjEK4UWFcApDLsFR"</span><span class="kwd"> level</span><span class="pun">=</span><span class="str">"Company"</span><span class="pln"> ids</span><span class="pun">=</span><span class="str">"101,56,68"</span><span class="pln"> </span><span class="kwd">template</span><span class="pun">=</span><span class="str">"dublin"</span> <span class="kwd">locale</span><span class="pun">=</span><span class="str">"da_DK"</span><span class="pun">]</span></p>
									<br>
									<p>Within wordpress you can now generate your short code:</p>
									<br>
									<ol>
										<li>Select template</li>
										<li>Select network/ team(s)</li>
										<li>Generate your short code and paste into a page</li>
										<li>Ensure that the page setting is a full width page</li>
									</ol>
								</td>
							</tr>
							<tr valign="top">
								<th scope="row">Update your network career page</th>
								<td>
									<p>Update your network, team and profile content on prodii.com and your home page will be updated accordingly. When team members update their profile your page will be updated as well.)</p>
								</td>
							</tr>
							<tr valign="top">
								<th scope="row">Test before you start</th>
								<td valign="top">
									<p>Please go ahead and copy/paste this sample short code into a full width page to see how it works:</p>
									<p><span class="pun">[</span><span class="pln">careerpages</span> <span class="kwd">key</span><span class="pun">=</span><span class="str">"WjEK4UWFcApDLsFR"</span><span class="kwd"> level</span><span class="pun">=</span><span class="str">"Network"</span><span class="pln"> ids</span><span class="pun">=</span><span class="str">"101,56,68"</span><span class="pln"> </span><span class="kwd">template</span><span class="pun">=</span><span class="str">"dublin"</span> <span class="kwd">locale</span><span class="pun">=</span><span class="str">"da_DK"</span><span class="pun">]</span></p>
								</td>
							</tr>
						</table>
					</div>
					';
		}

		//Prints out the admin settings page
		function prodii_settings_page() {
			self::set_admin_statistics('settings');

			$request = new WP_Http;
			$httpUrl = CareerpagesLibrary::getSiteUrl().'/common/careerpages/php/careerpagesadminhandler.php'; 
			$httpResult = $request->request( $httpUrl, array( 
				'method' => 'POST', 
				'body' => 	array(
								'action' => 'getKeyData',
								'key' => get_option("prodii_key")
							),
				'sslverify' => false
			));

			if(is_wp_error($httpResult)) {
				echo $httpResult->get_error_messages();
			} else {
				$data = json_decode($httpResult["body"], true);
			}
			
			echo 	'
					<div class="wrap">
						<h2>Prodii Settings</h2>
						<br>
						<p>If you find the this presentation plugin useful, please rate it <a target="_blank" href="http://wordpress.org/support/view/plugin-reviews/company-presentation#postform"> ★★★★★ </a>.</p>
						<br>
					';
			if (isset($data["teamowner"])) {
				echo 	'
						<table class="form-table">
							<tr valign="top">
								<th scope="row">Teamowner</th>
								<td>
									'.$data["teamowner"]["name"].'
								</td>
							</tr>
						</table>
						';
				}
			echo 	'
						<form method="post" action="options.php">
					';	
							settings_fields("prodii-settings");
							do_settings_sections("prodii-settings");
			echo 	'
							<table class="form-table">
								<tr valign="top">
									<th scope="row">Prodii Key</th>
									<td>
										<input type="text" name="prodii_key" value="'.get_option("prodii_key").'"/><br>
									</td>
								</tr>
							</table>
							<br>
							<br>
							<p>
								You have to get the Google map key from google, but you only need it if you use a template with maps.<br>Follow thise links in order to get some help: 
								<ul style="list-style-type: disc;padding-left: 30px;">
									<li>
										<a href="https://developers.google.com/maps/documentation/maps-static/intro" target="_blank">https://developers.google.com/maps/documentation/maps-static/intro</a>
									</li>
									<li>
										<a href="https://churchthemes.com/page-didnt-load-google-maps-correctly/" target="_blank">https://churchthemes.com/page-didnt-load-google-maps-correctly/</a>
									</li>
								</ul>
							</p>
							<table class="form-table">
								<tr valign="top">
									<th scope="row">Google-map Key</th>
									<td>
										<input type="text" class="regular-text" name="googlemap_key" value="'.get_option("googlemap_key").'"/>
									</td>
								</tr>
							</table>
							<br>
							'.get_submit_button().'
						</form>
					</div>
					';
		}

		//Prints out the admin shortcode page
		//function prodii_shortcode_page($hook) {
		function prodii_shortcode_page() {
			self::set_admin_statistics('shortcode');

			echo 	'
					<div class="wrap">
						<h2>Prodii Plugin Shortcode</h2>
						<br>
						<p>If you find the this presentation plugin useful, please rate it <a target="_blank" href="http://wordpress.org/support/view/plugin-reviews/company-presentation#postform"> ★★★★★ </a>.</p>
						<br>
						<form id="prodii_shortcode_form" method="post" action="'.admin_url('admin.php').'?page=prodii-shortcode">
							'.self::prodii_shortcode_content().'
						</form>
					</div>
					';

		}
		
		function prodii_shortcode_content() {
			//if (is_array($_REQUEST)) $content = "From prodii_shortcode_content <pre>".print_r($_REQUEST, true)."</pre>";
			$request = new WP_Http;
			$httpUrl = CareerpagesLibrary::getProdiiUrl().'/common/careerpages/php/careerpagesadminhandler.php'; 
			//$httpUrl = 'https://prodii.com/common/careerpages/php/careerpagesadminhandler.php'; 
			//curl_setopt($ch, CURLOPT_URL, 'https://prodii.com/common/careerpages/php/careerpagesadminhandler.php'); 
			$httpResult = $request->request( $httpUrl, array( 
				'method' => 'POST', 
				'body' => 	array(
								'action' => 'getShortcodeHtml',
								'key' => get_option("prodii_key"),
								'templateid' => isset($_REQUEST["prodii_templateid"]) ? $_REQUEST["prodii_templateid"] : '',
								'locale' => isset($_REQUEST["prodii_locale"]) ? $_REQUEST["prodii_locale"] : '',
								'css' => isset($_REQUEST["prodii_css"]) ? $_REQUEST["prodii_css"] : '',
								'companyid' => isset($_REQUEST["prodii_companyid"]) ? $_REQUEST["prodii_companyid"] : 0,
								'teamids' => isset($_REQUEST["prodii_teamids"]) ? $_REQUEST["prodii_teamids"] : '',
								'teamid' => isset($_REQUEST["prodii_teamid"]) ? $_REQUEST["prodii_teamid"] : 0,
								'memberid' => isset($_REQUEST["prodii_memberid"]) ? $_REQUEST["prodii_memberid"] : 0,
								'view' => isset($_REQUEST["prodii_view"]) ? $_REQUEST["prodii_view"] : 'tab-company'
							),
				'sslverify' => false
			));

			if(is_wp_error($httpResult)) {
				echo '<pre>'.print_r($httpResult->get_error_messages(), true).'</pre>';
			} else {
				$content = json_decode($httpResult["body"], true);
			}
			
			return $content;
		}

		function ajax_prodii_shortcode_content() {
			if (!isset($_POST["prodii_nonce"]) || !wp_verify_nonce($_POST["prodii_nonce"], 'prodii_nonce')) die('Permissions check failed');
			
			echo self::prodii_shortcode_content();
			
			die();
		}
	}
}


if (class_exists("ProdiiAdmin")) {
	$prodiiAdmin = new ProdiiAdmin();
}
		
if (!function_exists("update_prodii_settings")) {
	function update_prodii_settings() {
		register_setting('prodii-settings', 'prodii_key', array(
            'type' => 'string', 
            'sanitize_callback' => 'sanitize_text_field',
            'default' => NULL
		));
		register_setting('prodii-settings', 'googlemap_key', array(
            'type' => 'string', 
            'sanitize_callback' => 'sanitize_text_field',
            'default' => NULL
		));
	}
}

//Initialize the admin panel
if (!function_exists("prodii_adminpanel")) {
	function prodii_adminpanel() {
		global $prodii_shortcode_page;
		global $prodiiAdmin;
		if (!isset($prodiiAdmin)) {
			return;
		}

		add_menu_page( 'Prodii', 'Prodii', 'administrator', 'prodii', array(&$prodiiAdmin, 'printAdminDescriptionPage'), plugins_url('img/menu-logo.png' , __FILE__ ), 21);
		add_submenu_page( 'prodii', 'Description', 'Description', 'administrator', 'prodii-description', array(&$prodiiAdmin, 'prodii_description_page'));
		add_submenu_page( 'prodii', 'Settings', 'Settings', 'administrator', 'prodii-settings', array(&$prodiiAdmin, 'prodii_settings_page'));
		$prodii_shortcode_page = add_submenu_page( 'prodii', 'Shortcode', 'Shortcode', 'administrator', 'prodii-shortcode', array(&$prodiiAdmin, 'prodii_shortcode_page'));
		remove_submenu_page('prodii', 'prodii');
	}	
}
 
//Actions and Filters	
if (isset($prodiiAdmin)) {
	//Actions
	add_action('admin_menu', 'prodii_adminpanel');
	add_action('admin_init', 'update_prodii_settings');
	add_action('admin_enqueue_scripts', array(&$prodiiAdmin, 'addAdminHeaderCode'), 1);
	add_action('wp_ajax_prodii_shortcode_content', array(&$prodiiAdmin, 'ajax_prodii_shortcode_content'), 1);
	//Filters
}


?>