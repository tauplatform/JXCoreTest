//
//  Jxcore_tools.c
//  Jxcore
//
//  Created by Dmitry Soldatenkov on 19.04.16.
//
//

#include <stdio.h>


#import "../JXcore/bin/jx.h"


extern "C" void my_js_callback(JXValue *result, int argc) {
    //void *data_;
    //size_t size_;
    //JXValueType type_;
    
    char *data = JX_GetString(result+0);
    
    int o;
    
    o = 9;
    
    
}


extern "C"  void do_test_extension() {
    JX_DefineExtension("mytestFunctionzzz", my_js_callback);
}
