#import <Foundation/Foundation.h>
#include "common/app_build_capabilities.h"

#import <UIKit/UIKit.h>
#import "../JXcore/JXcore_.h"

#include "../../../shared/jxcoretau.h"

#include "common/RhodesApp.h"


extern void Init_Jxcore_API();


//extern void js_jxc_entry_point(const char* szJSON);


void init_jx_core_pure_c() {
    jxcoretau_init();
    
    const char* user_path = rho_rhodesapp_getuserrootpath();
    const char* root_path = rho_rhodesapp_getapprootpath();
    NSString* main_filename = [NSString stringWithFormat:@"%@/app/main.js", [NSString stringWithUTF8String:root_path]];
    NSString* jxcore_path = [NSString stringWithFormat:@"%@/app/jxcore/", [NSString stringWithUTF8String:root_path]];
    
    jxcoretau_start([main_filename UTF8String], [jxcore_path UTF8String], user_path);
    jxcoretau_start_app("app.js");
}


void init_jx_core() {
    // makes JXcore instance running under it's own thread
    [JXcore useSubThreading];
    
    // start engine (main file will be JS/main.js. This is the initializer file)
    [JXcore startEngine:@"apps/app/main"];
    
    // Define ScreenBrightness method to JS side so we can call it from there (see app.js)
    [JXcore addNativeBlock:^(NSArray *params, NSString *callbackId) {
        CGFloat br = 55.55;//[[UIScreen mainScreen] brightness];
        
        [JXcore callEventCallback:callbackId withJSON:[NSString stringWithFormat:@"%f", (float)br]];
    } withName:@"ScreenBrightness"];
    
    
    //[JXcore addNativeBlock:^(NSArray *params, NSString *callbackId) {
    //    NSString* json = [params objectAtIndex:0];
    //    js_jxc_entry_point([json UTF8String]);
    //    //[JXcore callEventCallback:callbackId withJSON:[NSString stringWithFormat:@"%f", (float)br]];
    //} withName:@"js_entry_point"];
    
    
    // Listen to Errors on the JS land
    [JXcore addNativeBlock:^(NSArray *params, NSString *callbackId) {
        NSString *errorMessage = (NSString*)[params objectAtIndex:0];
        NSString *errorStack = (NSString*)[params objectAtIndex:1];
        
        NSLog(@"Error!: %@\nStack:%@\n", errorMessage, errorStack);
    } withName:@"OnError"];
    
    
    // Second native method for JS side
    [JXcore addNativeBlock:^(NSArray *params, NSString *callbackId) {
        if (params == nil || [params count] == 0)
        {
            UIAlertView *alert = [[UIAlertView alloc] initWithTitle:@"No IPv4?"
                                                            message:@"Better connect to Wifi to test this application"
                                                           delegate:nil
                                                  cancelButtonTitle:@"OK"
                                                  otherButtonTitles:nil];
            [alert show];
            return;
        }
        
        NSString* ipaddress = [params objectAtIndex:0];
        NSString* ipaddress2 =  nil;
        
        if ([params count] > 2)
            ipaddress2 = [params objectAtIndex:1];
        
        dispatch_async(dispatch_get_main_queue(), ^{
            //[[self lblURL] setText:[NSString stringWithFormat:@"http://%@:3000/", ipaddress]];
            
            //if (ipaddress2 != nil)
            //    [[self lblURL2] setText:[NSString stringWithFormat:@"http://%@:3000/", ipaddress2]];
        });
    } withName:@"SetIPAddress"];
    
    
    // Start the application (app.js)
    NSArray *params = [NSArray arrayWithObjects:@"app.js", nil];
    [JXcore callEventCallback:@"StartApplication" withParams:params];
}

void do_test_jxcore() {
    NSArray *params = [NSArray arrayWithObjects:@"1234567890 TEST !!!", nil];
    [JXcore callEventCallback:@"UpdateHTML" withParams:params];
    
    
    //double delayInSeconds = 2.0;
    //dispatch_time_t popTime = dispatch_time(DISPATCH_TIME_NOW, (int64_t)(delayInSeconds * NSEC_PER_SEC));
    //dispatch_after(popTime, dispatch_get_main_queue(), ^(void){
    //    [[self lblTitle] setText:@"Say Something!"];
    //});
    
}


void Init_Jxcore_extension()
{
    //init_jx_core();
    init_jx_core_pure_c();
    Init_Jxcore_API();
}
