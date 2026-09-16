<div className="space-y-2">
                        <button
                          onClick={() => handleDeleteProperty(property.id)}
                          className="flex-1 px-3 py-2 bg-red-500 text-white text-sm rounded-md hover:bg-red-600"
                        >
                          {t('dealerDashboard.delete')}
                        </button>
                      </div>
                      <a
                        href={`/dealer/properties/${property.id}/edit`}
                        className="w-full text-center bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
                      >
                        {t('dealerDashboard.edit')}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}