{/* Approved Dishes */}
            {approvedDishes.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="border-0 shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                      <h3 className="text-xl font-bold">✅ Approved Dishes</h3>
                      <Badge className="bg-green-500">{approvedDishes.length}</Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {approvedDishes.map((dish, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.05 }}
                          onClick={() => viewDishDetails(dish)}
                          className="cursor-pointer"
                        >
                          <Card className="border-2 border-green-500 hover:shadow-xl transition-shadow">
                            <CardContent className="p-4">
                              {/* Health Score Badge */}
                              <div className="flex items-center justify-between mb-3">
                                <Badge className="bg-green-500 text-lg px-3 py-1">
                                  {dish.health_score}
                                </Badge>
                                <CheckCircle2 className="w-6 h-6 text-green-500" />
                              </div>

                              {/* Dish Name */}
                              <h4 className="font-bold text-lg mb-2 line-clamp-2">
                                {dish.name}
                              </h4>

                              {/* Price */}
                              {dish.price && (
                                <p className="text-sm text-muted-foreground mb-3">
                                  {dish.price}
                                </p>
                              )}

                              {/* Macros */}
                              <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
                                <div className="text-center p-2 rounded bg-secondary">
                                  <p className="font-bold">{dish.calories}</p>
                                  <p className="text-muted-foreground">cal</p>
                                </div>
                                <div className="text-center p-2 rounded bg-secondary">
                                  <p className="font-bold">{dish.protein}g</p>
                                  <p className="text-muted-foreground">protein</p>
                                </div>
                                <div className="text-center p-2 rounded bg-secondary">
                                  <p className="font-bold">{dish.carbs}g</p>
                                  <p className="text-muted-foreground">carbs</p>
                                </div>
                              </div>

                              {/* Top Positive */}
                              {dish.positives.length > 0 && (
                                <div className="flex items-start gap-2 p-2 rounded-lg bg-green-500/10 border border-green-500/20">
                                  <Sparkles className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                  <p className="text-xs text-green-700 dark:text-green-300">
                                    {dish.positives[0]}
                                  </p>
                                </div>
                              )}

                              {/* View Details */}
                              <Button 
                                variant="ghost" 
                                className="w-full mt-3 gap-2 text-xs"
                              >
                                View Details
                                <ChevronRight className="w-3 h-3" />
                              </Button>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Caution Dishes */}
            {cautionDishes.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="border-0 shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <AlertTriangle className="w-6 h-6 text-yellow-500" />
                      <h3 className="text-xl font-bold">⚠️ Caution - Can Be Modified</h3>
                      <Badge className="bg-yellow-500">{cautionDishes.length}</Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {cautionDishes.map((dish, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.05 }}
                          onClick={() => viewDishDetails(dish)}
                          className="cursor-pointer"
                        >
                          <Card className="border-2 border-yellow-500 hover:shadow-xl transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-3">
                                <Badge className="bg-yellow-500 text-lg px-3 py-1">
                                  {dish.health_score}
                                </Badge>
                                <AlertTriangle className="w-6 h-6 text-yellow-500" />
                              </div>

                              <h4 className="font-bold text-lg mb-2 line-clamp-2">
                                {dish.name}
                              </h4>

                              {dish.price && (
                                <p className="text-sm text-muted-foreground mb-3">
                                  {dish.price}
                                </p>
                              )}

                              <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
                                <div className="text-center p-2 rounded bg-secondary">
                                  <p className="font-bold">{dish.calories}</p>
                                  <p className="text-muted-foreground">cal</p>
                                </div>
                                <div className="text-center p-2 rounded bg-secondary">
                                  <p className="font-bold">{dish.protein}g</p>
                                  <p className="text-muted-foreground">protein</p>
                                </div>
                                <div className="text-center p-2 rounded bg-secondary">
                                  <p className="font-bold">{dish.carbs}g</p>
                                  <p className="text-muted-foreground">carbs</p>
                                </div>
                              </div>

                              {/* Modification Available */}
                              {dish.modifications.length > 0 && (
                                <div className="flex items-start gap-2 p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                  <Zap className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                                  <p className="text-xs text-blue-700 dark:text-blue-300">
                                    {dish.modifications[0]}
                                  </p>
                                </div>
                              )}

                              <Button 
                                variant="ghost" 
                                className="w-full mt-3 gap-2 text-xs"
                              >
                                View Modifications
                                <ChevronRight className="w-3 h-3" />
                              </Button>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Avoid Dishes */}
            {avoidDishes.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="border-0 shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <AlertTriangle className="w-6 h-6 text-red-500" />
                      <h3 className="text-xl font-bold">❌ Not Recommended</h3>
                      <Badge className="bg-red-500">{avoidDishes.length}</Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {avoidDishes.map((dish, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.05 }}
                          onClick={() => viewDishDetails(dish)}
                          className="cursor-pointer"
                        >
                          <Card className="border-2 border-red-500 hover:shadow-xl transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-3">
                                <Badge className="bg-red-500 text-lg px-3 py-1">
                                  {dish.health_score}
                                </Badge>
                                <AlertTriangle className="w-6 h-6 text-red-500" />
                              </div>

                              <h4 className="font-bold text-lg mb-2 line-clamp-2">
                                {dish.name}
                              </h4>

                              {dish.price && (
                                <p className="text-sm text-muted-foreground mb-3">
                                  {dish.price}
                                </p>
                              )}

                              <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
                                <div className="text-center p-2 rounded bg-secondary">
                                  <p className="font-bold text-red-600">{dish.calories}</p>
                                  <p className="text-muted-foreground">cal</p>
                                </div>
                                <div className="text-center p-2 rounded bg-secondary">
                                  <p className="font-bold">{dish.protein}g</p>
                                  <p className="text-muted-foreground">protein</p>
                                </div>
                                <div className="text-center p-2 rounded bg-secondary">
                                  <p className="font-bold text-red-600">{dish.fats}g</p>
                                  <p className="text-muted-foreground">fats</p>
                                </div>
                              </div>

                              {/* Red Flag */}
                              {dish.red_flags.length > 0 && (
                                <div className="flex items-start gap-2 p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                                  <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                                  <p className="text-xs text-red-700 dark:text-red-300">
                                    {dish.red_flags[0]}
                                  </p>
                                </div>
                              )}

                              <Button 
                                variant="ghost" 
                                className="w-full mt-3 gap-2 text-xs"
                              >
                                View Alternatives
                                <ChevronRight className="w-3 h-3" />
                              </Button>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* Dish Detail Dialog */}
      <Dialog open={showDishDetail} onOpenChange={setShowDishDetail}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedDish && (
            <div className="space-y-6">
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-2xl">{selectedDish.name}</DialogTitle>
                  <Badge className={`text-xl px-4 py-2 ${
                    selectedDish.approved ? 'bg-green-500' :
                    selectedDish.health_score >= 50 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}>
                    Score: {selectedDish.health_score}
                  </Badge>
                </div>
                {selectedDish.description && (
                  <DialogDescription className="text-base">
                    {selectedDish.description}
                  </DialogDescription>
                )}
              </DialogHeader>

              {/* Status Banner */}
              {selectedDish.approved ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-6 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-2 border-green-500"
                >
                  <div className="flex items-center gap-4">
                    <CheckCircle2 className="w-12 h-12 text-green-500" />
                    <div>
                      <h3 className="text-xl font-bold text-green-600 mb-1">✅ APPROVED!</h3>
                      <p className="text-sm">{selectedDish.reasoning}</p>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`p-6 rounded-xl border-2 ${
                    selectedDish.health_score >= 50
                      ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500'
                      : 'bg-gradient-to-br from-red-500/20 to-orange-500/20 border-red-500'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <AlertTriangle className={`w-12 h-12 ${
                      selectedDish.health_score >= 50 ? 'text-yellow-500' : 'text-red-500'
                    }`} />
                    <div>
                      <h3 className={`text-xl font-bold mb-1 ${
                        selectedDish.health_score >= 50 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {selectedDish.health_score >= 50 ? '⚠️ CAUTION' : '❌ NOT RECOMMENDED'}
                      </h3>
                      <p className="text-sm">{selectedDish.reasoning}</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Nutrition Facts */}
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-4">Nutrition Facts (Estimated)</h3>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center p-4 rounded-lg bg-secondary">
                      <p className="text-3xl font-bold">{selectedDish.calories}</p>
                      <p className="text-sm text-muted-foreground">Calories</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-secondary">
                      <p className="text-3xl font-bold text-blue-600">{selectedDish.protein}g</p>
                      <p className="text-sm text-muted-foreground">Protein</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-secondary">
                      <p className="text-3xl font-bold text-orange-600">{selectedDish.carbs}g</p>
                      <p className="text-sm text-muted-foreground">Carbs</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-secondary">
                      <p className="text-3xl font-bold text-yellow-600">{selectedDish.fats}g</p>
                      <p className="text-sm text-muted-foreground">Fats</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Red Flags */}
              {selectedDish.red_flags.length > 0 && (
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                      Health Concerns ({selectedDish.red_flags.length})
                    </h3>
                    <div className="space-y-2">
                      {selectedDish.red_flags.map((flag, idx) => (
                        <div key={idx} className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                          <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{flag}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Positives */}
              {selectedDish.positives.length > 0 && (
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-green-500" />
                      Health Benefits ({selectedDish.positives.length})
                    </h3>
                    <div className="space-y-2">
                      {selectedDish.positives.map((positive, idx) => (
                        <div key={idx} className="flex items-start gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                          <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{positive}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Smart Modifications */}
              {selectedDish.modifications.length > 0 && (
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                      <Zap className="w-5 h-5 text-blue-500" />
                      Smart Modifications
                    </h3>
                    <div className="space-y-2">
                      {selectedDish.modifications.map((mod, idx) => (
                        <div key={idx} className="flex items-start gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                          <Zap className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm font-semibold">{mod}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Better Alternatives */}
              {selectedDish.better_alternatives.length > 0 && (
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-500" />
                      Better Options on This Menu
                    </h3>
                    <div className="space-y-2">
                      {selectedDish.better_alternatives.map((alt, idx) => (
                        <div key={idx} className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                          <p className="text-sm font-semibold">{alt}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowDishDetail(false)}
                  className="flex-1"
                >
                  Close
                </Button>
                <Button
                  onClick={async () => {
                    await menuAnalyzer.saveOrderToHistory(
                      restaurantName,
                      selectedDish,
                      'lunch'
                    );
                    toast({
                      title: "Added to food diary! 📝",
                      description: `${selectedDish.name} tracked`
                    });
                    setShowDishDetail(false);
                  }}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500"
                >
                  Add to Diary
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
