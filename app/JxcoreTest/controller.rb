require 'rho/rhocontroller'
require 'helpers/application_helper'
require 'helpers/browser_helper'

class JxcoreTestController < Rho::RhoController
  include BrowserHelper
  include ApplicationHelper
  
  def index
    render :back => '/app'
  end

  def run_test_get_platform
    objects = Rho::Jxcore.enumerate
    obj = objects[0]
    res = obj.getPlatformName
    Alert.show_popup "Rho::Jxcore.getPlatformName return : #{res.to_s}"
    render :action => :index, :back => '/app'
  end

  def run_test_calc_summ
    objects = Rho::Jxcore.enumerate
    obj = objects[0]
    res = obj.calcSumm(2,3) 
    Alert.show_popup "Rho::Jxcore.calcSumm(2,3) return : #{res.to_s}"
    render :action => :index, :back => '/app'
  end

  def run_test_join_strings
    objects = Rho::Jxcore.enumerate
    obj = objects[0]
    res = obj.joinStrings("aaa","bbb") 
    Alert.show_popup "Rho::Jxcore.joinStrings(aaa,bbb) return : #{res.to_s}"
    render :action => :index, :back => '/app'
  end

  def open_express
      Rho::WebView.navigate('http://127.0.0.1:3000')
  end

  
end
