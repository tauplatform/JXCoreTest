#import <Foundation/Foundation.h>
#include "common/app_build_capabilities.h"

#import <UIKit/UIKit.h>
#import "../JXcore/JXcore_.h"

#include "../../../shared/jxcoretau.h"

#include "common/RhodesApp.h"


extern void Init_Jxcore_API();



void init_jx_core() {
    jxcoretau_init();
    
    const char* user_path = rho_rhodesapp_getuserrootpath();
    const char* root_path = rho_rhodesapp_getapprootpath();
    NSString* main_filename = [NSString stringWithFormat:@"%@/nodejs/main.js", [NSString stringWithUTF8String:root_path]];
    NSString* jxcore_path = [NSString stringWithFormat:@"%@/nodejs/server/", [NSString stringWithUTF8String:root_path]];
    
    jxcoretau_start([main_filename UTF8String], [jxcore_path UTF8String], user_path);
    jxcoretau_start_app("app.js");
    
    while (!jxcoretau_is_http_server_started()) {
        [NSThread sleepForTimeInterval:0.1f];
        NSLog(@"wait Node.js server ...");
    }
    
}


void Init_Jxcore_extension()
{
    init_jx_core();
    Init_Jxcore_API();
}
